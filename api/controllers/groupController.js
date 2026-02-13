// api/controllers/groupController.js
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * 1. OBTENER TODOS LOS GRUPOS DEL USUARIO (DASHBOARD)
 */
const getUserGroups = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ msg: 'No autorizado' });

    // Busca los grupos donde el usuario es miembro
    const groups = await Group.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("Error en getUserGroups:", err);
    res.status(500).json({ msg: 'Error al obtener los grupos' });
  }
};

/**
 * 2. CREAR UN NUEVO GRUPO
 */
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.auth?.userId;

    if (!name || !userId) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }

    const newGroup = new Group({
      name,
      members: [{ userId }], 
      createdBy: userId,
    });

    const group = await newGroup.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("Error en createGroup:", err);
    res.status(500).json({ msg: 'Error al crear el grupo' });
  }
};

/**
 * 3. OBTENER DETALLE DEL GRUPO (PÁGINA DE GRUPO)
 * Incluye nombres de Clerk, saldos y pagos sugeridos
 */
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth?.userId;

    // Buscamos el grupo en la DB
    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    // Verificamos si el usuario pertenece al grupo
    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No tienes permiso para ver este grupo' });

    // --- A. OBTENER NOMBRES REALES DE CLERK ---
    const userIds = group.members.map(m => m.userId);
    const userNamesMap = {};
    
    try {
      if (userIds.length > 0) {
        const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });
        clerkUsers.data.forEach(u => {
          // Lógica de prioridad para el nombre:
          // 1. Nombre y Apellido, 2. Solo nombre, 3. Username, 4. Email, 5. ID acortado
          const fullName = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName;
          const displayName = fullName || u.username || (u.emailAddresses[0]?.emailAddress.split('@')[0]) || `Usuario ${u.id.slice(-4)}`;
          userNamesMap[u.id] = displayName;
        });
      }
    } catch (clerkErr) {
      console.error("Error al conectar con Clerk:", clerkErr.message);
    }

    // --- B. CÁLCULO DE GASTOS Y DEUDAS ---
    const allExpenses = await Expense.find({ groupId }).lean() || [];
    
    // Gastos que aún no han sido marcados como pagados
    const activeExpenses = allExpenses.filter(e => !e.isSettled);

    const totalHistoricalAmount = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentActiveAmount = activeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const numMembers = group.members.length || 1;
    const averagePerPerson = currentActiveAmount / numMembers;

    // Calcular saldo de cada miembro
    const membersWithData = group.members.map(member => {
      const paidByThisMember = activeExpenses
        .filter(e => e.paidBy === member.userId)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const name = userNamesMap[member.userId] || `Usuario ${member.userId.slice(-4)}`;

      return {
        userId: member.userId,
        name: name,
        balance: paidByThisMember - averagePerPerson
      };
    });

    // --- C. ALGORITMO DE SIMPLIFICACIÓN DE PAGOS ---
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

    // Respuesta final combinada
    res.json({
      ...group,
      members: membersWithData,
      userNames: userNamesMap, // Diccionario ID -> Nombre para el historial en el front
      totalHistoricalAmount,
      currentActiveAmount,
      suggestedPayments
    });

  } catch (error) {
    console.error("Error crítico en getGroupById:", error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

/**
 * 4. UNIRSE A UN GRUPO EXISTENTE
 */
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.auth?.userId;

    if (!groupId) return res.status(400).json({ msg: 'ID de grupo requerido' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    // Verificar si ya es miembro
    const alreadyMember = group.members.some(m => m.userId === userId);
    if (alreadyMember) {
      return res.status(400).json({ msg: 'Ya eres miembro de este grupo' });
    }

    // Agregar nuevo miembro
    group.members.push({ userId });
    await group.save();

    res.json({ msg: 'Te has unido al grupo con éxito', group });
  } catch (error) {
    console.error("Error en joinGroup:", error);
    res.status(500).json({ msg: 'Error al intentar unirse al grupo' });
  }
};

module.exports = {
  getUserGroups,
  createGroup,
  getGroupById,
  joinGroup
};