const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
  },
  paidBy: {
    type: String, // ID de Clerk del usuario que pagó
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', ExpenseSchema);