// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const getUserGroups = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ msg: 'No autorizado' });
    const groups = await Group.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener los grupos' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.auth?.userId;
    if (!name || !userId) return res.status(400).json({ msg: 'Faltan datos' });
    const newGroup = new Group({ name, members: [{ userId }], createdBy: userId });
    const group = await newGroup.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Error al crear el grupo' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth?.userId;

    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No autorizado' });

    // --- CORRECCIÓN CLAVE PARA LOS NOMBRES ---
    const userIds = group.members.map(m => m.userId);
    const userNamesMap = {};
    
    try {
      if (userIds.length > 0) {
        // Pedimos los usuarios
        const response = await clerkClient.users.getUserList({ userId: userIds });
        
        // Verificamos si la respuesta es un array o tiene una propiedad data
        const users = Array.isArray(response) ? response : (response.data || []);
        
        users.forEach(u => {
          const fullName = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.firstName || "");
          const displayName = fullName || u.username || (u.emailAddresses && u.emailAddresses[0]?.emailAddress.split('@')[0]) || `Usuario ${u.id.slice(-4)}`;
          userNamesMap[u.id] = displayName;
        });
      }
    } catch (clerkErr) {
      console.error("Clerk Error:", clerkErr.message);
    }

    // --- CÁLCULO DE GASTOS ---
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
      
      const name = userNamesMap[m.userId] || `Usuario ${m.userId.slice(-4)}`;
      return { userId: m.userId, name: name, balance: paid - average };
    });

    // --- PAGOS SUGERIDOS ---
    let debtors = membersWithData.filter(m => m.balance < -0.01).map(m => ({...m}));
    let creditors = membersWithData.filter(m => m.balance > 0.01).map(m => ({...m}));
    const suggestedPayments = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(Math.abs(debtors[i].balance), creditors[j].balance);
      if (amount > 0.01) {
        suggestedPayments.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Number(amount.toFixed(2))
        });
      }
      debtors[i].balance += amount;
      creditors[j].balance -= amount;
      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }

    res.json({
      ...group,
      members: membersWithData,
      userNames: userNamesMap, // Se envía al front para el historial
      totalHistoricalAmount,
      currentActiveAmount,
      suggestedPayments
    });

  } catch (error) {
    console.error("Error crítico:", error);
    res.status(500).json({ msg: 'Error interno' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.auth?.userId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'No encontrado' });
    if (!group.members.some(m => m.userId === userId)) {
      group.members.push({ userId });
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Error al unirse' });
  }
};

module.exports = { getUserGroups, createGroup, getGroupById, joinGroup };