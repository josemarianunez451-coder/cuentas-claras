// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense'); // <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ
const { clerkClient } = require('@clerk/clerk-sdk-node'); // <--- 2. ASEGÚRATE DE ESTO

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
    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    // 1. Obtener nombres de los miembros desde Clerk
    const userIds = group.members.map(m => m.userId);
    const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
    
    // Crear un mapa de ID -> Nombre para fácil acceso
    const userNames = {};
    clerkUsers.data.forEach(u => {
      userNames[u.id] = u.firstName || u.username || "Usuario";
    });

    // 2. Buscar gastos (vigentes y totales)
    const allExpenses = await Expense.find({ groupId }).lean();
    const activeExpenses = allExpenses.filter(e => !e.isSettled);

    const totalHistoricalAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentActiveAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const averagePerPerson = group.members.length > 0 ? currentActiveAmount / group.members.length : 0;

    // 3. Calcular saldos individuales (solo gastos activos)
    const membersWithData = group.members.map(member => {
      const paidByThisMember = activeExpenses
        .filter(e => e.paidBy === member.userId)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        userId: member.userId,
        name: userNames[member.userId] || "Desconocido",
        balance: paidByThisMember - averagePerPerson
      };
    });

    // 4. ALGORITMO DE SIMPLIFICACIÓN DE DEUDAS
    // Creamos dos listas: deudores (balance negativo) y acreedores (balance positivo)
    let debtors = membersWithData.filter(m => m.balance < -0.01).sort((a, b) => a.balance - b.balance);
    let creditors = membersWithData.filter(m => m.balance > 0.01).sort((a, b) => b.balance - a.balance);
    
    const suggestedPayments = [];

    // Mientras haya gente que deba y gente a la que le deban...
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
      totalHistoricalAmount,
      currentActiveAmount,
      suggestedPayments,
      userNames // Enviamos el mapa de nombres al front
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al procesar el grupo' });
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