const router = require('express').Router();
const passport = require('passport');
const postmark = require("postmark");

const bcrypt = require("bcryptjs"); // Para gerar senhas temporárias
const jwt = require("jsonwebtoken");
const {
  loginUser,
  registerUser,
 

} = require("../controllers/User");

const User = require('../models/User');
const UserForm = require('../models/UserForm');


router.post("/signupUser", async (req, res) => {
  try {
    const {
      adminID,
      userID,
      name,
 
      mobilePhone,
      email,
      postalCode,
      address,
      addressNumber,
      complement,
      province,
      city,
      state,
   
    } = req.body;

    const existingUser = await UserForm.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email já cadastrado. Faça login ou utilize outro email.",
      });
    }

    const newUser = new UserForm({
      adminID,
      userID,
      name,

      mobilePhone,
      email,
      postalCode,
      address,
      addressNumber,
      complement,
      province,
      city,
      state,
   
      isRegistered: true, // Definir como true quando o usuário for criado
    });

    const savedUser = await newUser.save();

    

    res.status(201).json({
      user: savedUser,
      message: "Usuário criado com sucesso.",

    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao criar usuário." });
  }
});












// Middleware para verificar o token
// Autenticação Local
router.post('/signin', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Logged in', user: req.user,    token: req.authInfo.token });
  });
  

// Rota para iniciar a autenticação com Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Certifique-se de que isso está presente e configurado corretamente
  }));
  
  // Rota de callback para receber o token do Google
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // O token gerado estará disponível no req.authInfo
      res.json({
        message: 'Login successful',
        token: req.authInfo.token // Envie o token na resposta
      });
    }
  );
  

  const ensureAuthenticatedJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extrai o token do cabeçalho Authorization
  
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodifica o token
      const user = await User.findById(decoded.id); // Busca o usuário no banco de dados
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
  
      req.user = user; // Adiciona o usuário autenticado ao req
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };
  
  router.get('/rota-protegida', ensureAuthenticatedJWT, (req, res) => {
    res.json({ message: 'Você está autenticado com JWT!' });
  });
  
//  // Rota de perfil
// router.get('/profile', (req, res) => {
//     if (req.isAuthenticated()) {
//       // Enviar informações do perfil do usuário
//       res.json(req.user);
//     } else {
//       res.status(401).json({ message: 'Unauthorized' });
//     }
//   });

// Autenticação Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect('/dashboard'); // Redirecionar para o dashboard ou para onde preferir
});








router.post("/loginUser", loginUser); // Use directly from AuthController


// Função para enviar e-mail usando Postmark
const sendEmail = async (email, token) => {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

  try {
    const registrationLink = `http://localhost:5002/user/register/${token}`;

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
router.post("/user/register/request", async (req, res) => {
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
router.post("/user/register/:token", async (req, res) => {
  const { token } = req.params;
  const { email, password, role } = req.body;

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
    const user = await User.create({
      email,
      password,
      role,
    });

   
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

// Rota para registrar usuário com o token
router.post("/user/register/:token", async (req, res) => {
  const { token } = req.params;
  const { email, password, role } = req.body;

  try {
    // Verificar se o token é válido
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o e-mail no token corresponde ao fornecido no corpo da solicitação
    if (decodedToken.email !== email) {
      return res
        .status(400)
        .json({ success: false, error: "Token inválido para este e-mail." });
    }

    // Aqui você pode adicionar mais validações, se necessário
    // Verificação da composição da senha
    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
      });
    }
    // Criar usuário com e-mail e senha fornecidos
    const user = await User.create({
      email,
      password,
      role,
    });

    res
      .status(201)
      .json({
        user,
        success: true,
        message: "Usuário registrado com sucesso.",
      });
  } catch (error) {
    console.error("Erro ao registrar usuário", error);
    res
      .status(500)
      .json({ success: false, error: "Erro interno do servidor." });
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
    const user = await User.findOne({ email });
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

    const resetLink = `http://localhost:5002/user/reset-password/${resetToken}`;

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


router.post("/User", registerUser); // Use directly from AuthController









module.exports = router;
