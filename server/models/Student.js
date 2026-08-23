const mongoose = require('mongoose');

const trialAttemptSchema = new mongoose.Schema(
  {
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    date: {
      type: Date,
      required: true,
    },
    result: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending',
    },
    examinerNotes: {
      type: String,
      default: '',
    },
  },
  { _id: true, timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentType: {
      type: String,
      enum: ['Type1_NewLearner', 'Type2_TrialReady'],
      required: true,
      default: 'Type1_NewLearner',
    },
    branch: {
      type: String,
      enum: ['Maharagama', 'Werahara', 'Delgoda'],
      required: true,
    },
    // DMT Milestones Tracking
    dmtDates: {
      medicalExamDate: { type: Date, default: null },
      medicalExamPassed: { type: Boolean, default: null },
      learnerRegistrationDate: { type: Date, default: null },
      learnerExamDate: { type: Date, default: null },
      learnerExamPassed: { type: Boolean, default: false },
      learnerExamPassedDate: { type: Date, default: null },
    },
    // Practical Trial Management
    trial: {
      attempts: [trialAttemptSchema],
      attemptsUsed: {
        type: Number,
        default: 0,
        max: 3,
      },
      eligibleFromDate: { type: Date, default: null },
      deadlineDate: { type: Date, default: null },
      licenseObtained: { type: Boolean, default: false },
      licenseIssuedDate: { type: Date, default: null },
    },
    // Heavy Vehicle Eligibility & Prior Licensing
    lightVehicleLicenseDate: { type: Date, default: null },
    heavyVehicleEligible: { type: Boolean, default: false },
    
    // Package & Lesson Balance
    package: {
      type: {
        type: String,
        enum: ['Car_Full', 'Car_Refresher', 'Bike', 'ThreeWheeler', 'HeavyVehicle_Bus'],
        required: true,
      },
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      },
      lessonsTotal: {
        type: Number,
        required: true,
        default: 15,
      },
      lessonsUsed: {
        type: Number,
        default: 0,
      },
      priceTotal: {
        type: Number,
        required: true,
      },
      bonusLessons: {
        bike: { type: Number, default: 0 },
        threeWheeler: { type: Number, default: 0 },
      },
      additionalLessonsRequested: {
        type: Number,
        default: 0,
      },
    },
    registrationStatus: {
      type: String,
      enum: ['pending_payment', 'registered', 'in_progress', 'completed', 'cancelled'],
      default: 'pending_payment',
    },
    isAdvancePaid: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    advancePaymentAmount: {
      type: Number,
      default: 5000,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute DMT deadlines and enforce rules
studentSchema.pre('save', function (next) {
  // 1. Calculate Heavy Vehicle Eligibility if lightVehicleLicenseDate is provided (2+ years)
  if (this.lightVehicleLicenseDate) {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    this.heavyVehicleEligible = new Date(this.lightVehicleLicenseDate) <= twoYearsAgo;
  }

  // 2. Validate Heavy Vehicle package selection against eligibility
  if (this.package && this.package.type === 'HeavyVehicle_Bus' && !this.heavyVehicleEligible) {
    return next(
      new Error(
        'Heavy Vehicle (Bus) package requires holding a Light Vehicle driving license for at least 2 years.'
      )
    );
  }

  // 3. Auto-calculate Trial Timeline upon passing Learner Exam (3 months & 1.5 years)
  if (this.dmtDates && this.dmtDates.learnerExamPassedDate) {
    const passDate = new Date(this.dmtDates.learnerExamPassedDate);
    
    // Eligible 3 months after passing
    const eligibleDate = new Date(passDate);
    eligibleDate.setMonth(eligibleDate.getMonth() + 3);
    this.trial.eligibleFromDate = eligibleDate;

    // Deadline 1.5 years (18 months) after passing
    const deadline = new Date(passDate);
    deadline.setMonth(deadline.getMonth() + 18);
    this.trial.deadlineDate = deadline;
  }

  // 4. Update attemptsUsed count and check trial outcome
  if (this.trial && this.trial.attempts) {
    this.trial.attemptsUsed = this.trial.attempts.length;
    
    if (this.trial.attemptsUsed > 3) {
      return next(new Error('A student cannot exceed the maximum of 3 Trial attempts.'));
    }

    const passedAttempt = this.trial.attempts.find((a) => a.result === 'passed');
    if (passedAttempt) {
      this.trial.licenseObtained = true;
      if (!this.trial.licenseIssuedDate) {
        this.trial.licenseIssuedDate = passedAttempt.date || new Date();
      }
      this.registrationStatus = 'completed';
    }
  }

  // 5. Type 2 Trial-Ready shortcut
  if (this.studentType === 'Type2_TrialReady' && !this.dmtDates.learnerExamPassed) {
    this.dmtDates.learnerExamPassed = true;
    if (!this.dmtDates.learnerExamPassedDate) {
      this.dmtDates.learnerExamPassedDate = new Date();
    }
  }

  // 6. Sync Premium status with Advance Payment & Registration Status
  if (this.isAdvancePaid || ['registered', 'in_progress', 'completed'].includes(this.registrationStatus)) {
    this.isAdvancePaid = true;
    this.isPremium = true;
  } else {
    this.isPremium = false;
  }

  next();
});

module.exports = mongoose.model('Student', studentSchema);
