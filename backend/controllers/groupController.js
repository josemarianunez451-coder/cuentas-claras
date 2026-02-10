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

module.exports = {
  createGroup,
  getUserGroups, // ¡Importante exportar esto!
};