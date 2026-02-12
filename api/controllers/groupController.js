const Group = require('../models/Group');
const Expense = require('../models/Expense'); 
// @desc    Crear un nuevo grupo
// @route   POST /api/groups
// @access  Privado
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.auth.userId;

    if (!name) {
      return res.status(400).json({ msg: 'Por favor, añade un nombre para el grupo' });
    }
    if (!userId) {
        return res.status(401).json({ msg: 'No autorizado' });
    }

    const newGroup = new Group({
      name,
      members: [{ userId }], 
      createdBy: userId,
    });

    const group = await newGroup.save();
    res.status(201).json(group);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
};

// @desc    Obtener grupos del usuario
// @route   GET /api/groups
// @access  Privado
const getUserGroups = async (req, res) => {
  try {
    const userId = req.auth.userId;
    // Busca grupos donde el usuario esté en la lista de miembros
    const groups = await Group.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
};
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.auth.userId;

    const group = await Group.findById(groupId).lean(); // .lean() para poder editar el objeto

    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) return res.status(403).json({ msg: 'No autorizado' });

    // --- LÓGICA DE CÁLCULO DE DEUDAS ---
    const expenses = await Expense.find({ groupId });
    
    // 1. Calcular total gastado en el grupo
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // 2. Calcular cuánto debería haber puesto cada uno (promedio)
    const averagePerPerson = group.members.length > 0 ? totalAmount / group.members.length : 0;

    // 3. Calcular el saldo de cada miembro (Lo que puso - Lo que debía poner)
    const membersWithBalance = group.members.map(member => {
      const paidByThisMember = expenses
        .filter(exp => exp.paidBy === member.userId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        ...member,
        totalPaid: paidByThisMember,
        balance: paidByThisMember - averagePerPerson // Si es positivo, le deben. Si es negativo, debe.
      };
    });

    // Añadimos los cálculos al objeto que enviamos al frontend
    res.json({
      ...group,
      members: membersWithBalance,
      totalAmount,
      averagePerPerson
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.auth.userId;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: 'Grupo no encontrado' });
    }

    // Verificar si el usuario ya es miembro
    const alreadyMember = group.members.some(m => m.userId === userId);
    if (alreadyMember) {
      return res.status(400).json({ msg: 'Ya eres miembro de este grupo' });
    }

    // Añadir al usuario a la lista de miembros
    group.members.push({ userId });
    await group.save();

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al unirse al grupo');
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupById, 
  joinGroup, 

};