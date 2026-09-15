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

const learnerExamAttemptSchema = new mongoose.Schema(
  {
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    result: {
      type: String,
      enum: ['passed', 'failed'],
      required: true,
    },
    marks: {
      type: Number,
      default: null,
    },
    notes: {
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
    nic: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    studentType: {
      type: String,
      enum: ['Type1_NewLearner', 'Type2_TrialReady', 'Type 1', 'Type 2'],
      required: true,
      default: 'Type 1',
    },
    student_type: {
      type: String,
      enum: ['Type 1', 'Type 2'],
      default: 'Type 1',
    },
    branch: {
      type: String,
      enum: ['Maharagama', 'Werahara', 'Delgoda'],
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ['pending_verification', 'active', 'Unverified / Pending Payment', 'Verified', 'cancelled'],
      default: 'pending_verification',
    },
    account_status: {
      type: String,
      enum: ['Unverified / Pending Payment', 'Verified', 'Cancelled'],
      default: 'Unverified / Pending Payment',
    },
    advancePaymentStatus: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none',
    },
    learnerExamStatus: {
      type: String,
      enum: ['not_taken', 'passed', 'failed'],
      default: 'not_taken',
    },
    trialEligible: {
      type: Boolean,
      default: false,
    },
    trial_eligible: {
      type: Boolean,
      default: false,
    },
    // DMT Clearance proof for Type 2 (Trial-Ready) students
    dmt_clearance_proof: {
      type: String,
      default: null,
    },
    dmt_clearance_verified: {
      type: Boolean,
      default: false,
    },
    dmtClearanceVerifiedAt: {
      type: Date,
      default: null,
    },
    dmtClearanceVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    packagePaymentStatus: {
      type: String,
      enum: ['none', 'pending', 'confirmed'],
      default: 'none',
    },
    paymentPlan: {
      type: String,
      enum: ['full', 'installments', 'single', 'monthly'],
      default: 'full',
    },
    installmentsPaidCount: {
      type: Number,
      default: 0,
    },
    totalInstallments: {
      type: Number,
      default: 3,
    },
    lessonsUnlocked: {
      type: Number,
      default: 0,
    },
    lessonsUsed: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    // DMT Milestones Tracking
    dmtDates: {
      medicalExamDate: { type: Date, default: null },
      medicalExamPassed: { type: Boolean, default: null },
      medicalDone: { type: Boolean, default: false },
      medicalDoneDate: { type: Date, default: null },
      learnerRegistrationDate: { type: Date, default: null },
      registrationDone: { type: Boolean, default: false },
      registrationDoneDate: { type: Date, default: null },
      learnerExamDate: { type: Date, default: null },
      learnerExamPassed: { type: Boolean, default: false },
      learnerExamPassedDate: { type: Date, default: null },
      learnerExamMarks: { type: Number, default: null },
    },
    // Theory / Learner Written Exam Attempts (Max 3 attempts before auto-cancellation)
    learnerExamAttempts: [learnerExamAttemptSchema],
    learnerExamAttemptsCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    learnerExamMarks: {
      type: Number,
      default: null,
    },
    // Practical Trial Management
    trial: {
      attempts: [trialAttemptSchema],
      attemptsUsed: {
        type: Number,
        default: 0,
        max: 3,
      },
      trialDate: { type: Date, default: null },
      eligibleFromDate: { type: Date, default: null },
      deadlineDate: { type: Date, default: null },
      licenseObtained: { type: Boolean, default: false },
      licenseIssuedDate: { type: Date, default: null },
    },
    // Heavy Vehicle Eligibility & Prior Licensing
    lightVehicleLicenseDate: { type: Date, default: null },
    heavyVehicleEligible: { type: Boolean, default: false },
    
    // Package & Lesson Balance (Selected in US-14)
    package: {
      type: {
        type: String,
        enum: [
          'Car_Full',
          'Car_Refresher',
          'Bike',
          'ThreeWheeler',
          'HeavyVehicle_Bus',
          'Car_Individual',
          'Bike_Individual',
          'ThreeWheeler_Individual',
          'HeavyVehicle_Individual',
          'Bike_Standard',
          'ThreeWheeler_Standard',
          'Car_Standard',
          'HeavyVehicle_Standard',
          'Combo_Full',
          'HeavyVehicle_Full',
        ],
        default: null,
      },
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        default: null,
      },
      lessonsTotal: {
        type: Number,
        default: 0,
      },
      lessonsUsed: {
        type: Number,
        default: 0,
      },
      priceTotal: {
        type: Number,
        default: 0,
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
    advancePaymentReference: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute DMT deadlines and enforce rules
studentSchema.pre('save', function (next) {
  this.lastActivityDate = new Date();

  // Sync lessonsUsed with package.lessonsUsed
  if (this.package) {
    if (this.lessonsUsed !== undefined && this.package.lessonsUsed !== this.lessonsUsed) {
      this.package.lessonsUsed = this.lessonsUsed;
    } else if (this.package.lessonsUsed !== undefined) {
      this.lessonsUsed = this.package.lessonsUsed;
    }
  }

  // Derive trialEligible and trial_eligible status (US-02 vs US-01)
  const isType2 =
    this.student_type === 'Type 2' ||
    this.studentType === 'Type2_TrialReady' ||
    this.studentType === 'Type 2';

  if (isType2) {
    this.student_type = 'Type 2';
    this.studentType = 'Type2_TrialReady';
    this.trialEligible = true;
    this.trial_eligible = true;
    this.learnerExamStatus = 'passed';
    if (this.dmtDates) this.dmtDates.learnerExamPassed = true;
  } else {
    this.student_type = 'Type 1';
    this.studentType = this.studentType || 'Type1_NewLearner';
    if (this.learnerExamStatus === 'passed' || this.dmtDates?.learnerExamPassed) {
      this.trialEligible = true;
      this.trial_eligible = true;
      this.learnerExamStatus = 'passed';
      if (this.dmtDates) this.dmtDates.learnerExamPassed = true;
    } else {
      this.trialEligible = false;
      this.trial_eligible = false;
    }
  }
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
