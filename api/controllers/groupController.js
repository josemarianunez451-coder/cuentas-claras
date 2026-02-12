// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense'); // <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ

// @desc    Crear un nuevo grupo
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.auth.userId;

    if (!name) return res.status(400).json({ msg: 'El nombre es obligatorio' });

    const newGroup = new Group({
      name,
      members: [{ userId }], 
      createdBy: userId,
    });

    const group = await newGroup.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// @desc    Obtener grupos del usuario
const getUserGroups = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const groups = await Group.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del Servidor');
  }
};

// @desc    Obtener detalle del grupo con CÁLCULO DE SALDOS
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth.userId;

    // Buscamos el grupo
    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    // Verificamos si el usuario es miembro
    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No autorizado' });

    // --- LÓGICA DE SALDOS ---
    const expenses = await Expense.find({ groupId });
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averagePerPerson = group.members.length > 0 ? totalAmount / group.members.length : 0;

    const membersWithBalance = group.members.map(member => {
      const paidByThisMember = expenses
        .filter(exp => exp.paidBy === member.userId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        ...member,
        totalPaid: paidByThisMember,
        balance: paidByThisMember - averagePerPerson
      };
    });

    res.json({
      ...group,
      members: membersWithBalance,
      totalAmount,
      averagePerPerson
    });

  } catch (error) {
    console.error("Error en getGroupById:", error);
    res.status(500).json({ msg: 'Error al procesar los datos del grupo' });
  }
};

// @desc    Unirse a un grupo
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.auth.userId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    if (group.members.some(m => m.userId === userId)) {
      return res.status(400).json({ msg: 'Ya eres miembro' });
    }

    group.members.push({ userId });
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).send('Error al unirse');
  }
};

module.exports = { createGroup, getUserGroups, getGroupById, joinGroup };