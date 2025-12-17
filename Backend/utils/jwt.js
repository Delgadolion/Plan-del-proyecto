import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretoquevasacambiar';

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email
    },
    SECRET,
    { expiresIn: '7d' }
  );
}

function verificarToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

export { generarToken, verificarToken };
