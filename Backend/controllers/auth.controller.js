const Usuario = require('../models/Usuario');
const { generarToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Verificar si usuario existe
    let usuario = await Usuario.findOne({ $or: [{ email }, { username }] });
    if (usuario) {
      return res.status(400).json({ 
        message: 'El usuario o email ya existe' 
      });
    }

    // Crear nuevo usuario
    usuario = new Usuario({
      username,
      email,
      password
    });

    await usuario.save();

    // Generar token
    const token = generarToken(usuario._id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: usuario.toJSON()
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario y incluir password
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar password
    const esValido = await usuario.comparePassword(password);
    if (!esValido) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      message: 'Login exitoso',
      token,
      user: usuario.toJSON()
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario.toJSON());
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener perfil',
      error: error.message 
    });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout exitoso' });
};
