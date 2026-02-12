// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { clerkClient } = require('@clerk/clerk-sdk-node');

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

    // 1. Buscar el grupo
    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    // 2. Verificar membresía
    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No autorizado' });

    // 3. Obtener nombres de Clerk con manejo de errores total
    const userIds = group.members.map(m => m.userId);
    const userNames = {};
    
    try {
        // Solo llamamos a Clerk si hay usuarios que buscar
        if (userIds.length > 0) {
            const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
            if (clerkUsers && clerkUsers.data) {
                clerkUsers.data.forEach(u => {
                    userNames[u.id] = u.firstName || u.username || `Usuario ${u.id.slice(-4)}`;
                });
            }
        }
    } catch (clerkErr) {
        console.error("Clerk Error:", clerkErr.message);
        // Fallback: Si Clerk falla, no rompemos la app, usamos IDs
    }

    // 4. Buscar gastos y calcular montos
    const allExpenses = await Expense.find({ groupId }).lean();
    const activeExpenses = allExpenses.filter(e => !e.isSettled);

    const totalHistoricalAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentActiveAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Evitar división por cero
    const numMembers = group.members.length || 1;
    const averagePerPerson = currentActiveAmount / numMembers;

    // 5. Calcular saldos individuales
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

    // 6. Algoritmo de pagos sugeridos
    let debtors = membersWithData.filter(m => m.balance < -0.01).map(m => ({...m}));
    let creditors = membersWithData.filter(m => m.balance > 0.01).map(m => ({...m}));
    const suggestedPayments = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(Math.abs(debtors[i].balance), creditors[j].balance);
      if (amount > 0) {
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

    // 7. Respuesta final
    res.json({
      ...group,
      members: membersWithData,
      userNames, 
      totalHistoricalAmount,
      currentActiveAmount,
      suggestedPayments
    });

  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    res.status(500).json({ msg: 'Error interno del servidor', error: error.message });
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