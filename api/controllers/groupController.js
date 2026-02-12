// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// 1. OBTENER TODOS LOS GRUPOS DEL USUARIO
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

// 2. CREAR UN NUEVO GRUPO
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
    res.status(500).send('Error al crear grupo');
  }
};

// 3. OBTENER DETALLE DE UN GRUPO (CON SALDOS Y NOMBRES)
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth.userId;

    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No autorizado' });

    // Obtener nombres de Clerk
    const userIds = group.members.map(m => m.userId);
    const userNames = {};
    try {
        if (userIds.length > 0) {
            const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
            clerkUsers.data.forEach(u => {
                userNames[u.id] = u.firstName || u.username || "Usuario";
            });
        }
    } catch (err) {
        console.error("Error Clerk:", err.message);
    }

    // Buscar gastos y calcular deudas
    const allExpenses = await Expense.find({ groupId }).lean();
    const activeExpenses = allExpenses.filter(e => !e.isSettled);

    const totalHistoricalAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentActiveAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const numMembers = group.members.length || 1;
    const averagePerPerson = currentActiveAmount / numMembers;

    const membersWithData = group.members.map(member => {
      const paidByThisMember = activeExpenses
        .filter(e => e.paidBy === member.userId)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        userId: member.userId,
        name: userNames[member.userId] || `Usuario ${member.userId.slice(-4)}`,
        balance: paidByThisMember - averagePerPerson
      };
    });

    // Algoritmo de simplificación de deudas
    let debtors = membersWithData.filter(m => m.balance < -0.01).map(m => ({...m}));
    let creditors = membersWithData.filter(m => m.balance > 0.01).map(m => ({...m}));
    const suggestedPayments = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(Math.abs(debtors[i].balance), creditors[j].balance);
      suggestedPayments.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Number(amount.toFixed(2))
      });
      debtors[i].balance += amount;
      creditors[j].balance -= amount;
      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }

    res.json({
      ...group,
      members: membersWithData,
      userNames, 
      totalHistoricalAmount,
      currentActiveAmount,
      suggestedPayments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al procesar el grupo' });
  }
};

// 4. UNIRSE A UN GRUPO
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
    console.error(error);
    res.status(500).send('Error al unirse');
  }
};

// EXPORTAR TODAS LAS FUNCIONES
module.exports = { 
  createGroup, 
  getUserGroups, 
  getGroupById, 
  joinGroup 
};