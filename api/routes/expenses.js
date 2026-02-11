// backend/routes/expenses.js
const express = require('express');
const router = express.Router();
const { addExpense, getGroupExpenses } = require('../controllers/expenseController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.use(ClerkExpressRequireAuth());

router.post('/', addExpense);
router.get('/group/:groupId', getGroupExpenses);

module.exports = router;