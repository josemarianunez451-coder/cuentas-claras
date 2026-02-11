// backend/controllers/expenseController.js
const Expense = require('../models/Expense');

// @desc    Añadir un nuevo gasto a un grupo
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const { description, amount, groupId } = req.body;
    const userId = req.auth.userId;

    if (!description || !amount || !groupId) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }

    const newExpense = new Expense({
      description,
      amount,
      groupId,
      paidBy: userId,
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// @desc    Obtener todos los gastos de un grupo
// @route   GET /api/expenses/group/:groupId
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
};