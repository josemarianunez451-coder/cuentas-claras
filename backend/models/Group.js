const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del grupo es obligatorio'],
    trim: true,
  },
  members: [
    {
      userId: {
        type: String,
        required: true,
      },
    },
  ],
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Group', GroupSchema);