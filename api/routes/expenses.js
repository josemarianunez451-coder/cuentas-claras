// api/routes/expenses.js
const express = require('express');
const router = express.Router();
// IMPORTANTE: settleExpense debe estar en esta lista
const { 
  addExpense, 
  getGroupExpenses, 
  settleExpense 
} = require('../controllers/expenseController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.use(ClerkExpressRequireAuth());

router.post('/', addExpense);
router.get('/group/:groupId', getGroupExpenses);

// Esta es la línea 11 que daba el error:
router.patch('/:id/settle', settleExpense); 

module.exports = router;