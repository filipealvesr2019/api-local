const express = require("express");
const router = express.Router();
const postmark = require("postmark");
const validator = require("validator");
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs"); // Para gerar senhas temporárias
const jwt = require("jsonwebtoken");
const PixQRCode = require("../models/Pix/QRCodePIX");
const QRCode = require('qrcode');
const { ObjectId } = require('mongoose').Types;

const {
  getUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  getAllUsers,
  loginUser,
  registerAdmin,
  loginCustomer,
} = require("../controllers/admin");

const { Userlogout } = require("../controllers/admin");
const {
  isAuthenticated,
  isAdmin,
} = require("../middleware/middlewares.authMiddleware");
const AuthController = require("../controllers/admin");
const Ecommerce = require("../models/Ecommerce");

router.get("/users", isAuthenticated, getAllUsers); // Rota para buscar todos os usuários
router.post("/login", loginUser); // Use directly from AuthController

router.post("/admin", registerAdmin); // Use directly from AuthController

router.post("/loginCustumer", loginCustomer); // Use directly from AuthController

router.post("/user", registerAdmin); // Use directly from AuthController
router.get("/user/:id", getUser); // Rota para buscar usuário por ID
router.put("/user/:id", updateUser); // Rota para atualizar usuário por ID
router.delete("/user/:id", deleteUser); // Rota para excluir usuário por ID
router.get("/user", getUserByUsername); // Rota para buscar usuário por nome de usuário
router.route("/logout").post(Userlogout);
router.get("/rota-protegida", isAuthenticated, (req, res) => {
  res.json({ message: "Você está autenticado!" });
});

// Use o middleware isAdmin nas rotas que deseja proteger
router.get("/admin-only-route", isAuthenticated, isAdmin, (req, res) => {
  res.json({ message: "Esta rota só pode ser acessada por administradores." });
});

router.post("/admin-only-route", isAdmin, (req, res) => {
  res.json({ message: "Esta rota só pode ser acessada por administradores." });
});

// Outras rotas que não precisam de proteção
router.get("/public-route", (req, res) => {
  res.json({
    message: "Esta rota é pública e pode ser acessada por qualquer usuário.",
  });
});

router.post("/public-route", (req, res) => {
  res.json({
    message: "Esta rota é pública e pode ser acessada por qualquer usuário.",
  });
});

router.post("/forgot-password", AuthController.sendPasswordResetEmail);
// Rota para redefinir a senha
router.post("/reset-password/:token", AuthController.resetPassword);

// Função para enviar e-mail usando Postmark
const sendEmail = async (email, token) => {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

  try {
    const registrationLink = `http://localhost:5002/register/${token}`;

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
router.post("/admin/register/request", async (req, res) => {
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

// Rota para solicitar registro
router.post("/admin/register/:token", async (req, res) => {
  const { token } = req.params;
  const { subdomain, email, password, role } = req.body;

  try {
    // Verificar se o token é válido
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o e-mail no token corresponde ao fornecido no corpo da solicitação
    if (decodedToken.email !== email) {
      return res.status(400).json({ success: false, error: "Token inválido para este e-mail." });
    }

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

    const formatProductNameForURL = (subdomain) => {
      return subdomain
        .normalize("NFD") // Normaliza a string para decompor caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
        .toLowerCase() // Converte para letras minúsculas
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/[^\w\-]+/g, ""); // Remove caracteres não alfanuméricos (exceto hífens)
    };
    const formattedSubdomain = formatProductNameForURL(subdomain);

    
    // Ajuste do modelo Ecommerce
    const ecommerce = new Ecommerce({
      adminID: user._id,
      layout: 'layout1', // Ajuste conforme necessário
      dominio: formattedSubdomain,
      theme: {
        header: {
          Logo: 'https://i.imgur.com/bMWS6ec.png', // Ajuste conforme necessário
          backgroundColor: '#0088CC',
          color: '#ffffff',
          icons: ['https://i.imgur.com/n05IYkV.png', 'https://i.imgur.com/1XrvJJL.png', "https://i.imgur.com/ItjKDhc.png"]
        },
        footer: {
          backgroundColor: '#ffffff',
          color: '#222529',
        },
        main: {
          backgroundColor: '#ffffff',
          color: '#000000',
        },
      },
    });

    await ecommerce.save();
    res.status(201).json({
      user,
      success: true,
      message: "Usuário registrado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});


// Função para enviar email de recuperação de senha
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  // Verificar se o email foi fornecido
  if (!email) {
    return res.status(400).json({ message: "O email é obrigatório." });
  }

  try {
    // Verificar se o usuário existe no banco de dados
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Gerar um token de redefinição de senha
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m", // Token expira em 1 hora
    });
    // Enviar o email de recuperação de senha usando o Postmark
    const postmarkApiKey = process.env.POSTMARK_API_KEY;

    if (!postmarkApiKey) {
      console.error(
        "Chave do Postmark não encontrada. Configure a variável de ambiente POSTMARK_API_KEY."
      );
      return; // Ou faça outro tratamento de erro adequado
    }

    const client = new postmark.ServerClient(postmarkApiKey);

    const resetLink = `http://localhost:5002/reset-password/${resetToken}`;

    await client.sendEmail({
      From: "ceo@mediewal.com.br",
      To: email,
      Subject: "Redefinição de senha",
      TextBody: `Clique no seguinte link para se registrar: ${resetLink}`,

      HtmlBody: `
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
   }">Você solicitou uma redefinição de senha, clique no botão abaixo para redefinir sua senha:</p>
     
   <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: 400; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 1.2rem;">Redefinir Senha</a>

     </div>
   
  `,
    });
    res.status(200).json({
      message: "Email de recuperação de senha enviado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao enviar email de recuperação de senha:", error);
    res.status(500).json({
      message:
        "Erro interno do servidor ao enviar email de recuperação de senha.",
    });
  }
};
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "As senhas não coincidem." });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(400)
          .json({
            message:
              "O token expirou. Solicite um novo link de redefinição de senha.",
          });
      }
      console.error("Erro ao verificar token:", error);
      return res.status(400).json({ message: "Token inválido." });
    }

    const userId = decodedToken.userId;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Admin.updateOne({ _id: userId }, { password: hashedPassword });


    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao redefinir senha." });
  }
};

router.post("/forgot-password", sendPasswordResetEmail);
// Rota para redefinir a senha
router.post("/reset-password/:token", resetPassword);









router.post('/qr-code/', async (req, res) => {
  const { pixKey, adminID } = req.body;

  if (!pixKey) {
    return res.status(400).send('Pix Key is required');
  }

  try {
    // Gera o QR Code
    const qrCodeUrl = await QRCode.toDataURL(pixKey);

    // Salva o PIX e o QR Code no banco de dados
    const newPix = new PixQRCode({adminID: adminID, pixKey, qrCodeUrl });
    await newPix.save();

    res.status(201).send({ qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Rota para encontrar o QR Code pelo adminID
router.get('/qr-code/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se o adminID é válido
    if (!ObjectId.isValid(adminID)) {
      return res.status(400).json({ error: "Invalid admin ID" });
    }

    // Busca o QR Code no banco de dados pelo adminID
    const qrCode = await PixQRCode.findOne({ adminID: adminID });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code not found for this admin" });
    }

    // Retorna o QR Code encontrado
    res.status(200).json({ qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the QR Code" });
  }
});


// Rota para buscar todos os atendentes por adminID
router.get("/atendentes/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Busca todos os atendentes vinculados ao adminID e com role 'atendente'
    const atendentes = await Admin.find({ adminID, role: "atendente" });

    if (atendentes.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhum atendente encontrado para este adminID." });
    }

    res.status(200).json({ success: true, atendentes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para adicionar um atendente com adminID
router.post("/add-atendente", async (req, res) => {
  try {
    const { adminID, name,  cpfCnpj,  email, password, components } = req.body;

    // Verifica se o adminID é válido (existe um admin com esse ID)
    const admin = await Admin.findById(adminID);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin não encontrado!" });
    }

    // Criação de um novo atendente vinculado ao adminID
    const atendente = new Admin({
      adminID,  // Relaciona o atendente ao administrador
      name,
      cpfCnpj,
      email,
      password,
      role: "atendente", // Define automaticamente como atendente
      components, // Lista de componentes associados ao atendente
    });

    // Salva o atendente no banco de dados
    await atendente.save();

    res.status(201).json({ success: true, message: "Atendente cadastrado com sucesso!" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
module.exports = router;
