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
      enum: ['pending', 'passed', 'failed', 'absent'],
      default: 'pending',
    },
    score: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'absent'],
      default: 'pending',
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    examinerNotes: {
      type: String,
      default: '',
    },
    notes: {
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
      enum: ['passed', 'failed', 'absent'],
      required: true,
    },
    marks: {
      type: Number,
      default: null,
      min: [0, 'Marks cannot be less than 0'],
      max: [40, 'Marks cannot exceed 40'],
    },
    notes: {
      type: String,
      default: '',
    },
    examinerNotes: {
      type: String,
      default: '',
    },
  },
  { _id: true, timestamps: true }
);

const finalLicenseSchema = new mongoose.Schema(
  {
    licenseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    licensePhotoUrl: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    uploadedByRole: {
      type: String,
      enum: ['student', 'staff', 'admin', null],
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['not_uploaded', 'uploaded', 'verified', 'rejected'],
      default: 'not_uploaded',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const registrationCycleSchema = new mongoose.Schema(
  {
    cycleId: {
      type: String,
      required: true,
      default: () => `CYCLE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    cycleNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'active',
        'expiring_soon',
        'expired',
        'attempts_exhausted',
        'passed',
        'passed_pending_license',
        'completed',
        'pending_payment',
        'cancelled',
      ],
      default: 'active',
    },
    isAdvancePaid: {
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
    advancePaymentDate: {
      type: Date,
      default: null,
    },
    dmtDates: {
      medicalExamDate: { type: Date, default: null },
      medicalExamPassed: { type: Boolean, default: null },
      medicalDone: { type: Boolean, default: false },
      medicalDoneDate: { type: Date, default: null },
      medicalDocumentUrl: { type: String, default: null },
      medicalRemarks: { type: String, default: null },
      learnerRegistrationDate: { type: Date, default: null },
      registrationDone: { type: Boolean, default: false },
      registrationDoneDate: { type: Date, default: null },
      registrationDocumentUrl: { type: String, default: null },
      registrationRemarks: { type: String, default: null },
      learnerExamDate: { type: Date, default: null },
      learnerExamPassed: { type: Boolean, default: false },
      learnerExamPassedDate: { type: Date, default: null },
      learnerExamMarks: { type: Number, default: null },
      learnerExamDocumentUrl: { type: String, default: null },
    },
    examAttempts: [learnerExamAttemptSchema],
    examAttemptsCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    trialAttempts: [trialAttemptSchema],
    trialAttemptsCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    trial: {
      attempts: [trialAttemptSchema],
      attemptsUsed: { type: Number, default: 0, max: 3 },
      trialDate: { type: Date, default: null },
      licenseObtained: { type: Boolean, default: false },
      licenseIssuedDate: { type: Date, default: null },
    },
    trial_date: { type: Date, default: null },
    isPassed: {
      type: Boolean,
      default: false,
    },
    passedAt: {
      type: Date,
      default: null,
    },
    passedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    finalLicense: {
      type: finalLicenseSchema,
      default: () => ({}),
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
    name: {
      type: String,
      trim: true,
      default: '',
    },
    studentName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
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
    profilePicture: {
      type: String,
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
      trim: true,
      required: true,
    },
    accountStatus: {
      type: String,
      enum: [
        'pending_verification',
        'active',
        'inactive',
        'suspended',
        'deactivated',
        'Unverified / Pending Payment',
        'Verified',
        'cancelled',
        'Cancelled',
      ],
      default: 'pending_verification',
    },
    account_status: {
      type: String,
      enum: ['Unverified / Pending Payment', 'Verified', 'Deactivated', 'Cancelled', 'cancelled'],
      default: 'Unverified / Pending Payment',
    },
    verificationStatus: {
      type: String,
      enum: ['Pending Verification', 'Verified'],
      default: 'Pending Verification',
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
    registration_date: { type: Date, default: null },
    medical_date: { type: Date, default: null },
    medicalDocumentUrl: { type: String, default: null },
    medicalRemarks: { type: String, default: null },
    registrationDocumentUrl: { type: String, default: null },
    registrationRemarks: { type: String, default: null },
    written_exam_date: { type: Date, default: null },
    written_exam_status: {
      type: String,
      enum: ['Pending', 'Pass', 'Fail', 'pending', 'passed', 'failed', null],
      default: 'Pending',
    },
    dmtDates: {
      medicalExamDate: { type: Date, default: null },
      medicalExamPassed: { type: Boolean, default: null },
      medicalExamStatus: {
        type: String,
        enum: ['pending', 'passed', 'failed', null],
        default: null,
      },
      medicalDone: { type: Boolean, default: false },
      medicalDoneDate: { type: Date, default: null },
      medicalDocumentUrl: { type: String, default: null },
      medicalRemarks: { type: String, default: null },
      learnerRegistrationDate: { type: Date, default: null },
      registrationDone: { type: Boolean, default: false },
      registrationDoneDate: { type: Date, default: null },
      registrationDocumentUrl: { type: String, default: null },
      registrationRemarks: { type: String, default: null },
      learnerExamDate: { type: Date, default: null },
      learnerExamPassed: { type: Boolean, default: false },
      learnerExamPassedDate: { type: Date, default: null },
      learnerExamMarks: {
        type: Number,
        default: null,
        min: [0, 'Marks cannot be less than 0'],
        max: [40, 'Marks cannot exceed 40'],
      },
      learnerExamDocumentUrl: { type: String, default: null },
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
      min: [0, 'Marks cannot be less than 0'],
      max: [40, 'Marks cannot exceed 40'],
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
    // Shared Officer-assigned Trial Date (applies to both Type 1 and Type 2)
    trial_date: { type: Date, default: null },
    trial_date_set_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    trial_date_set_at: {
      type: Date,
      default: null,
    },
    // Heavy Vehicle Eligibility & Prior Licensing
    lightVehicleLicenseDate: { type: Date, default: null },
    heavyVehicleEligible: { type: Boolean, default: false },

    // Package & Lesson Balance (Selected in US-14)
    package: {
      type: {
        type: String,
        default: null,
        trim: true,
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
    // DMT 1.5-Year Learner License Lifecycle & Multi-Cycle Tracking
    learnerLicenseStartDate: {
      type: Date,
      default: null,
    },
    learnerLicenseExpiryDate: {
      type: Date,
      default: null,
    },
    learnerLicenseStatus: {
      type: String,
      enum: [
        'active',
        'expiring_soon',
        'expired',
        'attempts_exhausted',
        'passed',
        'passed_pending_license',
        'completed',
        'pending_payment',
        'cancelled',
      ],
      default: 'active',
    },
    currentCycleNumber: {
      type: Number,
      default: 1,
    },
    registrationCycles: [registrationCycleSchema],
    finalLicense: {
      type: finalLicenseSchema,
      default: () => ({}),
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    passedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure student's name, email, and phone are synced from User
studentSchema.pre('save', async function (next) {
  if ((!this.name || !this.studentName || !this.email || !this.phone) && this.userId) {
    try {
      const User = mongoose.model('User');
      const u = await User.findById(this.userId).select('name email phone');
      if (u) {
        if (!this.name && u.name) this.name = u.name;
        if (!this.studentName && u.name) this.studentName = u.name;
        if (!this.email && u.email) this.email = u.email;
        if (!this.phone && u.phone) this.phone = u.phone;
      }
    } catch (e) {
      // Ignore sync lookup error
    }
  }
  if (typeof next === 'function') next();
});

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

  // Sync top-level dates and statuses with dmtDates & trial
  if (!this.dmtDates) this.dmtDates = {};

  if (this.registration_date && !this.dmtDates.learnerRegistrationDate) {
    this.dmtDates.learnerRegistrationDate = this.registration_date;
  } else if (this.dmtDates.learnerRegistrationDate) {
    this.registration_date = this.dmtDates.learnerRegistrationDate;
  }

  if (this.medical_date && !this.dmtDates.medicalExamDate) {
    this.dmtDates.medicalExamDate = this.medical_date;
  } else if (this.dmtDates.medicalExamDate) {
    this.medical_date = this.dmtDates.medicalExamDate;
  }

  if (this.written_exam_date && !this.dmtDates.learnerExamDate) {
    this.dmtDates.learnerExamDate = this.written_exam_date;
  } else if (this.dmtDates.learnerExamDate) {
    this.written_exam_date = this.dmtDates.learnerExamDate;
  }

  // Sync proof documents & remarks between top level and dmtDates
  if (this.medicalDocumentUrl && !this.dmtDates.medicalDocumentUrl) {
    this.dmtDates.medicalDocumentUrl = this.medicalDocumentUrl;
  } else if (this.dmtDates.medicalDocumentUrl) {
    this.medicalDocumentUrl = this.dmtDates.medicalDocumentUrl;
  }
  if (this.medicalRemarks && !this.dmtDates.medicalRemarks) {
    this.dmtDates.medicalRemarks = this.medicalRemarks;
  } else if (this.dmtDates.medicalRemarks) {
    this.medicalRemarks = this.dmtDates.medicalRemarks;
  }
  if (this.registrationDocumentUrl && !this.dmtDates.registrationDocumentUrl) {
    this.dmtDates.registrationDocumentUrl = this.registrationDocumentUrl;
  } else if (this.dmtDates.registrationDocumentUrl) {
    this.registrationDocumentUrl = this.dmtDates.registrationDocumentUrl;
  }
  if (this.registrationRemarks && !this.dmtDates.registrationRemarks) {
    this.dmtDates.registrationRemarks = this.registrationRemarks;
  } else if (this.dmtDates.registrationRemarks) {
    this.registrationRemarks = this.dmtDates.registrationRemarks;
  }

  // Sync learnerExamMarks between root and dmtDates
  if (this.learnerExamMarks !== undefined && this.learnerExamMarks !== null) {
    if (this.dmtDates) this.dmtDates.learnerExamMarks = this.learnerExamMarks;
  } else if (this.dmtDates?.learnerExamMarks !== undefined && this.dmtDates?.learnerExamMarks !== null) {
    this.learnerExamMarks = this.dmtDates.learnerExamMarks;
  }

  // DMT Written Theory Exam Rule: Derive overall exam status from attempts array.
  // CRITICAL: A passed attempt on attempt 2 or 3 must ALWAYS override previous failed attempts.
  const isType2Student =
    this.student_type === 'Type 2' ||
    this.studentType === 'Type2_TrialReady' ||
    this.studentType === 'Type 2';

  if (!isType2Student) {
    const theoryAttempts = this.learnerExamAttempts || [];

    // Rule: If ANY attempt in the current cycle has result === 'passed', overall status = passed
    const hasPassedAttempt = theoryAttempts.some((a) => a.result === 'passed');
    const allFailed =
      theoryAttempts.length >= 3 && !hasPassedAttempt;

    if (hasPassedAttempt) {
      // Passed on attempt 1, 2, or 3 — status is PASSED regardless of earlier failures
      this.learnerExamStatus = 'passed';
      this.written_exam_status = 'Pass';
      if (this.dmtDates) this.dmtDates.learnerExamPassed = true;
    } else if (allFailed) {
      // All 3 attempts failed
      this.learnerExamStatus = 'failed';
      this.written_exam_status = 'Fail';
      if (this.dmtDates) this.dmtDates.learnerExamPassed = false;
    } else if (theoryAttempts.length > 0) {
      // Some attempts recorded, none passed yet, still has remaining attempts
      this.learnerExamStatus = 'failed';
      this.written_exam_status = 'Fail';
      if (this.dmtDates) this.dmtDates.learnerExamPassed = false;
    } else {
      // No attempt records — fall back to marks-based derivation for legacy data
      if (this.learnerExamMarks !== null && this.learnerExamMarks !== undefined) {
        if (this.learnerExamMarks <= 30) {
          this.written_exam_status = 'Fail';
          this.learnerExamStatus = 'failed';
          if (this.dmtDates) this.dmtDates.learnerExamPassed = false;
        } else {
          // Marks > 30 with no attempts array: treat as passed (legacy)
          if (this.learnerExamStatus === 'passed') {
            this.written_exam_status = 'Pass';
            if (this.dmtDates) this.dmtDates.learnerExamPassed = true;
          }
        }
      }

      // Sync written_exam_status ↔ learnerExamStatus for records with no attempts array
      if (this.written_exam_status) {
        if (this.written_exam_status === 'Pass' || this.written_exam_status === 'passed') {
          this.written_exam_status = 'Pass';
          this.learnerExamStatus = 'passed';
          if (this.dmtDates) this.dmtDates.learnerExamPassed = true;
        } else if (this.written_exam_status === 'Fail' || this.written_exam_status === 'failed') {
          this.written_exam_status = 'Fail';
          this.learnerExamStatus = 'failed';
          if (this.dmtDates) this.dmtDates.learnerExamPassed = false;
        } else {
          this.written_exam_status = 'Pending';
          if (!this.learnerExamStatus || this.learnerExamStatus === 'not_taken') {
            this.learnerExamStatus = 'not_taken';
          }
        }
      } else if (this.learnerExamStatus) {
        if (this.learnerExamStatus === 'passed') {
          this.written_exam_status = 'Pass';
        } else if (this.learnerExamStatus === 'failed') {
          this.written_exam_status = 'Fail';
        } else {
          this.written_exam_status = 'Pending';
        }
      }
    }
  }


  if (this.trial_date) {
    if (!this.trial) this.trial = {};
    this.trial.trialDate = this.trial_date;
  } else if (this.trial?.trialDate) {
    this.trial_date = this.trial.trialDate;
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
      this.isPassed = true;
      this.passedAt = this.passedAt || passedAttempt.date || new Date();
      // Only mark fully 'completed' if the student has uploaded their driving license certificate
      const hasCertificate = Boolean(
        this.finalLicense?.licensePhotoUrl ||
        this.finalLicense?.verificationStatus === 'verified' ||
        this.finalLicense?.verificationStatus === 'uploaded'
      );
      if (hasCertificate) {
        this.registrationStatus = 'completed';
        this.learnerLicenseStatus = 'completed';
      } else {
        // Trial passed but awaiting license certificate upload
        this.registrationStatus = 'completed';
        if (this.learnerLicenseStatus !== 'completed') {
          this.learnerLicenseStatus = 'passed_pending_license';
        }
      }
    } else if (this.trial.attemptsUsed >= 3) {
      this.registrationStatus = 'cancelled';
      this.accountStatus = 'cancelled';
      this.account_status = 'Cancelled';
      this.learnerLicenseStatus = 'attempts_exhausted';
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

  // 7. Evaluate DMT Learner License Lifecycle & Multi-Cycle Sync
  this.evaluateLifecycle();

  next();
});

// Helper to compute 18 months expiry date (License Start Date + 18 months)
function compute18MonthExpiry(startDate) {
  const d = new Date(startDate || Date.now());
  const expiry = new Date(d);
  expiry.setMonth(expiry.getMonth() + 18);
  return expiry;
}

studentSchema.methods.evaluateLifecycle = function () {
  let changed = false;
  if (!this.registrationCycles) {
    this.registrationCycles = [];
  }

  if (this.registrationCycles.length === 0) {
    const start =
      this.learnerLicenseStartDate ||
      this.registration_date ||
      this.dmtDates?.learnerRegistrationDate ||
      this.createdAt ||
      new Date();
    const expiry = this.learnerLicenseExpiryDate || compute18MonthExpiry(start);
    this.registrationCycles.push({
      cycleId: `CYCLE-1-${Date.now()}`,
      cycleNumber: 1,
      startDate: start,
      expiryDate: expiry,
      status: this.learnerLicenseStatus || 'active',
      isAdvancePaid: Boolean(this.isAdvancePaid),
      advancePaymentAmount: this.advancePaymentAmount || 5000,
      advancePaymentReference: this.advancePaymentReference || '',
      dmtDates: this.dmtDates ? JSON.parse(JSON.stringify(this.dmtDates)) : {},
      examAttempts: this.learnerExamAttempts || [],
      examAttemptsCount: (this.learnerExamAttempts || []).length,
      isPassed: this.learnerExamStatus === 'passed' || Boolean(this.dmtDates?.learnerExamPassed),
      finalLicense: this.finalLicense || {},
    });
    this.currentCycleNumber = 1;
    this.learnerLicenseStartDate = start;
    this.learnerLicenseExpiryDate = expiry;
    changed = true;
  }

  let currentCycle =
    this.registrationCycles.find((c) => c.cycleNumber === this.currentCycleNumber) ||
    this.registrationCycles[this.registrationCycles.length - 1];

  if (currentCycle) {
    // Sync dates
    if (!currentCycle.startDate) {
      currentCycle.startDate =
        this.learnerLicenseStartDate || this.registration_date || this.createdAt || new Date();
      changed = true;
    }
    if (!currentCycle.expiryDate) {
      currentCycle.expiryDate = compute18MonthExpiry(currentCycle.startDate);
      changed = true;
    }
    this.learnerLicenseStartDate = currentCycle.startDate;
    this.learnerLicenseExpiryDate = currentCycle.expiryDate;

    // Sync attempts & marks
    currentCycle.examAttempts = this.learnerExamAttempts || [];
    currentCycle.examAttemptsCount = (this.learnerExamAttempts || []).length;
    currentCycle.trialAttempts = this.trial?.attempts || [];
    currentCycle.trialAttemptsCount = (this.trial?.attempts || []).length;
    if (this.trial) {
      currentCycle.trial = {
        attempts: this.trial.attempts || [],
        attemptsUsed: this.trial.attemptsUsed || (this.trial.attempts || []).length,
        trialDate: this.trial.trialDate || this.trial_date || null,
        licenseObtained: Boolean(this.trial.licenseObtained),
        licenseIssuedDate: this.trial.licenseIssuedDate || null,
      };
    }
    currentCycle.trial_date = this.trial_date || this.trial?.trialDate || null;
    currentCycle.isAdvancePaid = Boolean(this.isAdvancePaid);
    currentCycle.isPassed = Boolean(this.isPassed || currentCycle.isPassed);
    if (this.finalLicense && (this.finalLicense.photoUrl || this.finalLicense.licensePhotoUrl)) {
      currentCycle.finalLicense = this.finalLicense;
    }

    // Evaluate statuses
    const now = new Date();
    // 'completed' requires both passing the trial AND uploading the driving license certificate
    const hasCertificateUploaded = Boolean(
      this.finalLicense?.licensePhotoUrl ||
      this.finalLicense?.verificationStatus === 'verified' ||
      this.finalLicense?.verificationStatus === 'uploaded' ||
      currentCycle.finalLicense?.licensePhotoUrl ||
      currentCycle.finalLicense?.verificationStatus === 'verified'
    );
    const isTrialPassedNow = Boolean(
      this.trial?.licenseObtained ||
      (this.trial?.attempts || []).some((a) => a.result === 'passed')
    );
    const isCompleted =
      this.learnerLicenseStatus === 'completed' ||
      (isTrialPassedNow && hasCertificateUploaded);

    // Intermediate state: trial passed but certificate not yet uploaded
    const isPassedPendingLicense = isTrialPassedNow && !hasCertificateUploaded;

    // Check Condition A: 3 attempts failed (Trial OR Theory)
    const trialAttempts = this.trial?.attempts || [];
    const isTrialExhausted =
      trialAttempts.length >= 3 && !trialAttempts.some((a) => a.result === 'passed');
    const theoryAttempts = currentCycle.examAttempts || this.learnerExamAttempts || [];
    const isTheoryExhausted =
      theoryAttempts.length >= 3 && !theoryAttempts.some((a) => a.result === 'passed');
    const areAttemptsExhausted = isTrialExhausted || isTheoryExhausted;

    // Check Condition B: 18 months expired
    const is18MonthsExpired = now > currentCycle.expiryDate;

    if (isCompleted) {
      if (currentCycle.status !== 'completed' || this.learnerLicenseStatus !== 'completed') {
        currentCycle.status = 'completed';
        this.learnerLicenseStatus = 'completed';
        this.registrationStatus = 'completed';
        changed = true;
      }
    } else if (isPassedPendingLicense) {
      if (currentCycle.status !== 'passed_pending_license' || this.learnerLicenseStatus !== 'passed_pending_license') {
        currentCycle.status = 'passed_pending_license';
        this.learnerLicenseStatus = 'passed_pending_license';
        this.registrationStatus = 'completed';
        changed = true;
      }
    } else if (this.isPassed === true || currentCycle.isPassed === true || this.learnerLicenseStatus === 'passed') {
      if (currentCycle.status !== 'passed' || this.learnerLicenseStatus !== 'passed') {
        currentCycle.status = 'passed';
        this.learnerLicenseStatus = 'passed';
        changed = true;
      }
    } else if (is18MonthsExpired) {
      // Condition B – 18 Months Expired (Independent cancellation)
      if (currentCycle.status !== 'expired' || this.learnerLicenseStatus !== 'expired') {
        currentCycle.status = 'expired';
        this.learnerLicenseStatus = 'expired';
        this.registrationStatus = 'cancelled';
        this.accountStatus = 'cancelled';
        this.account_status = 'Cancelled';
        this.isAdvancePaid = false;
        this.isPremium = false;
        changed = true;
      }
    } else if (areAttemptsExhausted) {
      // Condition A – All 3 Attempts Failed (Independent cancellation)
      if (currentCycle.status !== 'attempts_exhausted' || this.learnerLicenseStatus !== 'attempts_exhausted') {
        currentCycle.status = 'attempts_exhausted';
        this.learnerLicenseStatus = 'attempts_exhausted';
        this.registrationStatus = 'cancelled';
        this.accountStatus = 'cancelled';
        this.account_status = 'Cancelled';
        this.isAdvancePaid = false;
        this.isPremium = false;
        changed = true;
      }
    } else {
      const diffDays = Math.ceil((currentCycle.expiryDate - now) / (1000 * 60 * 60 * 24));
      const targetStatus =
        diffDays <= 30
          ? 'expiring_soon'
          : this.registrationStatus === 'pending_payment' && !this.isAdvancePaid
            ? 'pending_payment'
            : 'active';
      if (currentCycle.status !== targetStatus || this.learnerLicenseStatus !== targetStatus) {
        currentCycle.status = targetStatus;
        this.learnerLicenseStatus = targetStatus;
        changed = true;
      }
    }
  }

  return changed;
};

const Student = mongoose.model('Student', studentSchema);
Student.compute18MonthExpiry = compute18MonthExpiry;

module.exports = Student;
