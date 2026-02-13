// api/controllers/expenseController.js
const Expense = require('../models/Expense');

// 1. AÑADIR GASTO
const addExpense = async (req, res) => {
  try {
    const { description, amount, groupId, comment } = req.body;
    const userId = req.auth.userId;

    if (!description || !amount || !groupId) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }

    const newExpense = new Expense({
      description,
      amount,
      groupId,
      paidBy: userId,
      comment: comment || ""
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// 2. OBTENER GASTOS DE UN GRUPO
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

// 3. MARCAR COMO PAGADO (La función que faltaba)
const settleExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ msg: 'Gasto no encontrado' });
    }

    expense.isSettled = true;
    await expense.save();

    res.json({ msg: 'Gasto marcado como pagado', expense });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// EXPORTAR TODAS LAS FUNCIONES
module.exports = {
  addExpense,
  getGroupExpenses,
  settleExpense, 
};