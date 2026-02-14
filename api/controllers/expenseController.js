const Expense = require('../models/Expense');

// 1. AÑADIR GASTO (Actualizado con categoría)
const addExpense = async (req, res) => {
  try {
    const { description, amount, groupId, comment, category } = req.body;
    const userId = req.auth.userId;

    if (!description || !amount || !groupId) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }

    const newExpense = new Expense({
      description,
      amount,
      groupId,
      paidBy: userId,
      comment: comment || "",
      category: category || "Otros" // <--- NUEVO
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// 2. OBTENER GASTOS
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

// 3. MARCAR COMO PAGADO
const settleExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Gasto no encontrado' });
    expense.isSettled = true;
    await expense.save();
    res.json({ msg: 'Gasto saldado' });
  } catch (err) {
    res.status(500).send('Error');
  }
};

// 4. BORRAR GASTO (Opción 1)
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Gasto no encontrado' });

    // Solo el que lo creó puede borrarlo (opcional, por seguridad)
    if (expense.paidBy !== req.auth.userId) {
      return res.status(403).json({ msg: 'No tienes permiso para borrar este gasto' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).send('Error al borrar');
  }
};

// 5. ACTUALIZAR/EDITAR GASTO (Opción 1)
const updateExpense = async (req, res) => {
  try {
    const { description, amount, category, comment } = req.body;
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Gasto no encontrado' });

    if (expense.paidBy !== req.auth.userId) {
      return res.status(403).json({ msg: 'No tienes permiso para editar' });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: { description, amount, category, comment } },
      { new: true }
    );

    res.json(expense);
  } catch (err) {
    res.status(500).send('Error al actualizar');
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  settleExpense,
  deleteExpense,
  updateExpense
};