const Group = require('../models/Group');

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

    // Buscar el grupo por ID
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: 'Grupo no encontrado' });
    }

    // Seguridad: Verificar que el usuario sea miembro del grupo
    const isMember = group.members.some(member => member.userId === userId);
    
    if (!isMember) {
      return res.status(403).json({ msg: 'No tienes permiso para ver este grupo' });
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};


module.exports = {
  createGroup,
  getUserGroups,
  getGroupById, // ¡Importante exportar esto!
};