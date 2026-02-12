const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true }, 
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, trim: true }, 
  isSettled: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);