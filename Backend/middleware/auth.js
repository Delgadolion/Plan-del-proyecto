import { verificarToken } from '../utils/jwt.js';

function auth(req, res, next) {
  const header = req.headers['authorization'];

  if (!header) {
    console.log('❌ No se envió token en Authorization header');
    return res.status(401).json({ error: 'No se envió token' });
  }

  const token = header.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    console.log('❌ Token vacío o formato inválido (esperado: "Bearer TOKEN")');
    return res.status(401).json({ error: 'Token vacío' });
  }

  const decoded = verificarToken(token);

  if (!decoded) {
    console.log('❌ Token inválido o expirado');
    return res.status(403).json({ error: 'Token inválido' });
  }

  console.log('✅ Token verificado | Usuario ID:', decoded.id, '| Email:', decoded.email);
  req.user = decoded; // ahora cualquier controlador sabe quién es el usuario

  next();
}

export default auth;
