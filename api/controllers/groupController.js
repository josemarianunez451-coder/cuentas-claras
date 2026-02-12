// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// 1. OBTENER GRUPOS (Dashboard)
const getUserGroups = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ msg: 'No autenticado' });

    const groups = await Group.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("Error en getUserGroups:", err);
    res.status(500).json({ msg: 'Error al obtener grupos', error: err.message });
  }
};

// 2. CREAR GRUPO
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.auth?.userId;
    if (!name) return res.status(400).json({ msg: 'Nombre obligatorio' });

    const newGroup = new Group({
      name,
      members: [{ userId }], 
      createdBy: userId,
    });

    const group = await newGroup.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("Error en createGroup:", err);
    res.status(500).json({ msg: 'Error al crear grupo' });
  }
};

// 3. OBTENER DETALLE (Página de Grupo) con lógica de deudas
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth?.userId;

    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'No encontrado' });

    const isMember = group.members.some(m => m.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'Acceso denegado' });

    // --- Obtener nombres de Clerk con SEGURIDAD TOTAL ---
    const userNames = {};
    try {
      const userIds = group.members.map(m => m.userId);
      if (userIds.length > 0) {
        const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
        clerkUsers.data.forEach(u => {
          userNames[u.id] = u.firstName || u.username || "Usuario";
        });
      }
    } catch (clerkErr) {
      console.error("Fallo Clerk SDK:", clerkErr.message);
      // No cortamos la ejecución, seguimos con los IDs
    }

    // --- Cálculos de Gastos ---
    const allExpenses = await Expense.find({ groupId }).lean() || [];
    const activeExpenses = allExpenses.filter(e => !e.isSettled);

    const totalHistoricalAmount = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentActiveAmount = activeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const numMembers = group.members.length || 1;
    const average = currentActiveAmount / numMembers;

    const membersWithData = group.members.map(m => {
      const paid = activeExpenses
        .filter(e => e.paidBy === m.userId)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      return {
        userId: m.userId,
        name: userNames[m.userId] || `Usuario ${m.userId.slice(-4)}`,
        balance: paid - average
      };
    });

    // --- Pagos Sugeridos ---
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
    console.error("Error crítico:", error);
    res.status(500).json({ msg: 'Error de servidor' });
  }
};

// 4. UNIRSE A GRUPO
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.auth?.userId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'No encontrado' });
    if (group.members.some(m => m.userId === userId)) return res.status(400).json({ msg: 'Ya eres miembro' });

    group.members.push({ userId });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Error al unirse' });
  }
};

module.exports = { getUserGroups, createGroup, getGroupById, joinGroup };