const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: true,
      trim: true,
    },
    account_number: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    account_name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'State Bank',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BankDetail', bankDetailSchema);
