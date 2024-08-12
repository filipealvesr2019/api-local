const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); // Importe o modelo do usuário aqui




// Middleware para verificar se o usuário autenticado é um administrador
const isAdmin = async (req, res, next) => {
    try {
      // Obtenha o ID do usuário autenticado a partir do token JWT
      const userId = req.user.id;
  
      // Encontre o usuário no banco de dados
      const user = await Admin.findById(userId);
  
      // Verifique se o usuário tem a credencial de administrador
      if (user.role !== 'administrador') {
        return res.status(403).json({ message: 'Acesso negado: apenas administradores podem acessar esta rota.' });
      }
  
      // Se o usuário for um administrador, permita o acesso à rota
      next();
    } catch (error) {
      console.error('Erro ao verificar credenciais de administrador:', error);
      res.status(500).json({ message: 'Erro ao verificar credenciais de administrador.' });
    }
  };


  

// Middleware para verificar se o usuário autenticado é um administrador
const isManager = async (req, res, next) => {
  try {
    // Obtenha o ID do usuário autenticado a partir do token JWT
    const userId = req.user.id;

    // Encontre o usuário no banco de dados
    const user = await Admin.findById(userId);

    // Verifique se o usuário tem a credencial de administrador
    if (user.role !== 'Gerente') {
      return res.status(403).json({ message: 'Acesso negado: apenas Gerentes podem acessar esta rota.' });
    }

    // Se o usuário for um administrador, permita o acesso à rota
    next();
  } catch (error) {
    console.error('Erro ao verificar credenciais de administrador:', error);
    res.status(500).json({ message: 'Erro ao verificar credenciais de administrador.' });
  }
};
  
// Middleware para verificar se o usuário está autenticado
const isAuthenticated = async (req, res, next) => {
    try {
        // Verifique se o cabeçalho Authorization está presente
        const authHeader = req.headers.authorization;
    
        if (!authHeader) {
          return res.status(401).json({ message: 'Token de acesso não fornecido.' });
        }
    
        // Verifique se o cabeçalho Authorization começa com "Bearer"
        const [bearer, token] = authHeader.split(' ');
    
        if (bearer !== 'Bearer' || !token) {
          return res.status(401).json({ message: 'Token de acesso inválido.' });
        }
    
        // Verifique se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        if(!decoded){
          return res.status(401).json({ message: 'Token de acesso inválido.' });
        }
        // Verifique se o usuário existe no banco de dados
        const user = await Admin.findById(decoded.id);
    
        if (!user) {
          return res.status(401).json({ message: 'Usuário não encontrado.' });
        }
    
        // Adicione o usuário ao objeto de solicitação para uso posterior
        req.user = user;
    
        // Chame o próximo middleware
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Token de acesso inválido.' });
      }
};
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
};

module.exports = { isAuthenticated, isAdmin, isManager, ensureAuthenticated };