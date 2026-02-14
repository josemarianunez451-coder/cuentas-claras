const express = require('express');
const router = express.Router();
const { 
  addExpense, 
  getGroupExpenses, 
  settleExpense, 
  deleteExpense, 
  updateExpense 
} = require('../controllers/expenseController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.use(ClerkExpressRequireAuth());

router.post('/', addExpense);
router.get('/group/:groupId', getGroupExpenses);
router.patch('/:id/settle', settleExpense);
router.delete('/:id', deleteExpense); 
router.put('/:id', updateExpense);  

module.exports = router;