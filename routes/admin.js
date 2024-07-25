const express = require("express");
const router = express.Router();
const postmark = require('postmark');
const validator = require('validator');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs'); // Para gerar senhas temporárias
const jwt = require("jsonwebtoken");
const {
  getUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  getAllUsers,
  loginUser,
  registerAdmin,
  loginCustomer
} = require("../controllers/admin");

const { Userlogout } = require("../controllers/admin");
const { isAuthenticated, isAdmin } = require("../middleware/middlewares.authMiddleware");
const AuthController = require('../controllers/admin')
router.get("/users",isAuthenticated, getAllUsers); // Rota para buscar todos os usuários
router.post("/login", loginUser); // Use directly from AuthController

router.post("/admin",  registerAdmin); // Use directly from AuthController

router.post("/loginCustumer", loginCustomer); // Use directly from AuthController

router.post("/user",  registerAdmin); // Use directly from AuthController
router.get("/user/:id", getUser); // Rota para buscar usuário por ID
router.put("/user/:id", updateUser); // Rota para atualizar usuário por ID
router.delete("/user/:id", deleteUser); // Rota para excluir usuário por ID
router.get("/user", getUserByUsername); // Rota para buscar usuário por nome de usuário
router.route("/logout").post( Userlogout);
router.get('/rota-protegida', isAuthenticated, (req, res) => {
  res.json({ message: 'Você está autenticado!' });
});

// Use o middleware isAdmin nas rotas que deseja proteger
router.get('/admin-only-route',isAuthenticated, isAdmin, (req, res) => {
  res.json({ message: 'Esta rota só pode ser acessada por administradores.' });
});

router.post('/admin-only-route', isAdmin, (req, res) => {
  res.json({ message: 'Esta rota só pode ser acessada por administradores.' });
});

// Outras rotas que não precisam de proteção
router.get('/public-route', (req, res) => {
  res.json({ message: 'Esta rota é pública e pode ser acessada por qualquer usuário.' });
});

router.post('/public-route', (req, res) => {
  res.json({ message: 'Esta rota é pública e pode ser acessada por qualquer usuário.' });
});

router.post("/forgot-password", AuthController.sendPasswordResetEmail);
// Rota para redefinir a senha
router.post('/reset-password/:token',  AuthController.resetPassword);





// Função para enviar e-mail usando Postmark
const sendEmail = async (email, token) => {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
   
  try {
    const registrationLink = `http://localhost:5173/register/${token}`;

    await client.sendEmail({
      From: "ceo@mediewal.com.br",
      To: email,
      Subject: "Link de registro",
      TextBody: `Clique no seguinte link para se registrar: ${registrationLink}`,
      HtmlBody: `<p>
      
      
      <div style="width: 100vw; height: 10vh; background-color: black;    display: flex;
      justify-content: center;
      align-items: center;">
            <img src="https://i.ibb.co/B3xYDzG/Logo-mediewal-1.png" alt="" />
     </div>
      

    
    
    <div style="display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;">
    <p style=" font-weight: 400;
    font-size: 1.8rem;
    text-align: center;
    margin-top: 5rem;

    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }">      
  <p style="display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;">
  <p style=" font-weight: 400;
  font-size: 1.6rem;
  text-align: center;
  margin-top: 3rem;

  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}">Clique no butão  para se <a href="${registrationLink}">cadastrar</a>.</p></p>
    
  <a href="${registrationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: 400; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 1.2rem;">Cadastrar-se</a>

    </div>
    `,
    });

    console.log("E-mail enviado com sucesso");
  } catch (error) {
    console.error("Erro ao enviar e-mail", error);
  }
};

// Rota para solicitar registro
router.post("/register/request", async (req, res) => {
  const { email } = req.body;

  try {
    // Gerar token JWT com duração de 10 minutos
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Enviar e-mail com o link de registro contendo o token
    await sendEmail(email, token);

    res.status(200).json({ success: true, message: "Link de registro enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao solicitar registro", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});

// Rota para registrar usuário com o token
router.post("/register/:token", async (req, res) => {
  const { token } = req.params;
  const { email, password, role } = req.body;

  try {

    // Verificar se o token é válido
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o e-mail no token corresponde ao fornecido no corpo da solicitação
    if (decodedToken.email !== email) {
      return res.status(400).json({ success: false, error: "Token inválido para este e-mail." });
    }

    // Aqui você pode adicionar mais validações, se necessário
// Verificação da composição da senha
const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    success: false,
    error: "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
  });
}
    // Criar usuário com e-mail e senha fornecidos
    const user = await Admin.create({
      email,
      password,
      role,
    });

    res.status(201).json({ user, success: true, message: "Usuário registrado com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar usuário", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});

module.exports = router;