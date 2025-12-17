import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Rutas de autenticación existentes
// Estas rutas están directamente en index.js:
// POST /api/register
// POST /api/login
// GET /api/verify

// Ruta protegida para verificar token
router.get('/check', auth, (req, res) => {
  res.json({ user: req.user });
});

// Ruta protegida de prueba
router.get('/protegida', auth, (req, res) => {
  res.json({ message: 'Acceso permitido', user: req.user });
});

export default router;
