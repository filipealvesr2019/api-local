// controllers/AuthController.js
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sendToken = require("../utils/jwtToken");
const postmark = require("postmark");
const bcrypt = require("bcrypt");

// cadastro de usuarios => /api/v1/register
const registerAdmin = async (req, res, next) => {
  const { email, password, role } = req.body;

  if (password.length < 10) {
    return res.status(400).json({
      success: false,
      error: "A senha deve ter pelo menos 10 caracteres.",
    });
  }

 // Verificação da composição da senha
 const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
 if (!passwordRegex.test(password)) {
   return res.status(400).json({
     success: false,
     error: "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
   });
 }
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Digite um endereço de email válido.",
    });
  }

  try {
    const user = await Admin.create({
      email,
      password,
      role,
    });

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Erro, ao cadastrar usuario", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
    });
  }
};


let loginAttempts = {}; // Objeto para armazenar o número de tentativas de login de cada usuário
let blockedUsers = {}; // Objeto para armazenar os usuários bloqueados

const MAX_LOGIN_ATTEMPTS = 7; // Número máximo de tentativas de login permitidas
const BLOCK_DURATION = 1800000; // Duração do bloqueio em milissegundos (30 minutos)

// Função para retornar o número de tentativas restantes para o login
const remainingLoginAttempts = (email) => {
  const attempts = loginAttempts[email] || 0;
  const remaining = MAX_LOGIN_ATTEMPTS - attempts;

  // Ajuste para retornar 1 quando a contagem for 0
  const adjustedRemaining = remaining > 0 ? remaining : 1;
  return adjustedRemaining;
};

// Função para bloquear o usuário após exceder o número máximo de tentativas
const blockUser = (email) => {
  console.log(`Bloqueando usuário ${email}`);
  blockedUsers[email] = true; // Marca o usuário como bloqueado
  // Remove o bloqueio após a duração especificada
  setTimeout(() => {
    console.log(`Removendo bloqueio para usuário ${email}`);
    delete blockedUsers[email]; // Remove o usuário da lista de bloqueados
  }, BLOCK_DURATION);
};

// Função para logar usuário com JWT token
const loginCustomer = async (req, res, next) => {
  const { email, password } = req.body;

  // Verifica se o usuário está bloqueado
  if (blockedUsers[email]) {
    console.log("Usuário bloqueado");
    return res.status(401).json({
      success: false,
      error: "Usuário bloqueado. Tente novamente mais tarde.",
    });
  }

  // Verifica se o email e a senha foram fornecidos
  if (!email || !password) {
    console.log("Email ou senha ausentes");
    return res.status(400).json({
      success: false,
      error: "Email e senha são obrigatórios.",
    });
  }

  // Procurando usuário no banco de dados
  const user = await Admin.findOne({ email }).select("+password +role");

  if (!user) {
    console.log("Usuário não encontrado");
    // Incrementa o contador de tentativas de login
    loginAttempts[email] = (loginAttempts[email] || 0) + 1;
    return res.status(401).json({
      success: false,
      error: "Email ou senha inválidos.",
      remainingAttempts: remainingLoginAttempts(email), // Retorna o número de tentativas restantes
    });
  }

  // Verifica se a senha está correta
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    console.log("Senha incorreta");
    const remainingAttempts = MAX_LOGIN_ATTEMPTS - (loginAttempts[email] || 0);
    console.log(`Tentativas restantes: ${remainingAttempts}`);
  
    // Incrementa o contador de tentativas de login
    loginAttempts[email] = (loginAttempts[email] || 0) + 1;
    
    if (loginAttempts[email] >= MAX_LOGIN_ATTEMPTS) {
      blockUser(email); // Bloqueia o usuário se exceder o número máximo de tentativas
    }
    
    return res.status(401).json({
      success: false,
      error: "Email ou senha inválidos.",
      remainingAttempts: remainingAttempts, // Retorna o número de tentativas restantes
    });
  }
  
  

  // Limpa o contador de tentativas de login se o login for bem-sucedido
  delete loginAttempts[email];

  // Verifica o papel (role) do usuário e executa ações específicas, se necessário

  // Envie o token para o usuário
  console.log("Enviando token para o usuário");
  sendToken(user, 200, res);
};

















// logar usuario com JWT token
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // verifica se o usuario esta logado com email e senha
  if (!email || !password) {
    console.log("Email ou senha ausentes");
    return res.status(400).json({
      success: false,
      error: "Email e senha são obrigatórios.",
    });
  }


 

  // procurando usuario no banco de dados
  const user = await Admin.findOne({ email }).select("+password +role");

  if (!user) {
    console.log("Usuário não encontrado");
    return res.status(401).json({
      success: false,
      error: "Email ou senha inválidos.",
    });
  }

  // verifica se a senha está correta ou não
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    console.log("Senha incorreta");
    return res.status(401).json({
      success: false,
      error: "Email ou senha inválidos.",
    });
  }

  // Agora, dependendo do papel (role) do usuário, você pode realizar ações específicas
  if (user.role === "administrador") {
    // Lógica para administrador
    // Adicione aqui as ações específicas para o administrador
  }
  // Envie o token para o usuário
  console.log("Enviando token para o usuário");
  sendToken(user, 200, res);
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Admin.findById(userId).exec();
    if (!user) {
      return res.status(404).send("Usuário não encontrado!");
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno do servidor ao buscar usuário!");
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, role } = req.body;
    const updatedUser = await Admin.findByIdAndUpdate(
      userId,
      { email, password, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send("Usuário não encontrado para atualização!");
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(400).send("Erro ao atualizar usuário!");
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await Admin.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send("Usuário não encontrado para exclusão!");
    }
    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(400).send("Erro ao excluir usuário!");
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const username = req.query.username; // Obtendo o nome de usuário do query parameters
    const user = await Admin.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).send("Usuário não encontrado!");
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).send("Erro ao buscar usuário especifico!");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Admin.find({ role: { $ne: "customer" } });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(400).send("Erro do servidor ao buscar todos os usuários!");
  }
};

// deslogar um usuario api/v1/logout
const logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Deslogado",
  });
};

// deslogar um usuario api/v1/logout
// AuthController.js
const Userlogout = async (req, res, next) => {
  try {
    // Lógica para limpar o cookie com o token
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // Resposta com uma mensagem de sucesso
    res.status(200).json({
      success: true,
      message: "Deslogado com sucesso.",
    });
  } catch (error) {
    // Trate qualquer erro que ocorra durante o logout
    console.error("Erro ao fazer logout:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao fazer logout.",
    });
  }
};

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

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

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

// Função para redefinir a senha
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Verificar se todas as informações necessárias foram fornecidas
  if (!token || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    // Verificar se as senhas fornecidas coincidem
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "As senhas não coincidem." });
    }

    // Tentar verificar e decodificar o token JWT
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ message: "O token expirou. Solicite um novo link de redefinição de senha." });
      }
      throw error; // Se não for um erro de expiração, lança o erro para o bloco catch global
    }

    const userId = decodedToken.userId;

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha do usuário no banco de dados
    await Admin.updateOne({ _id: userId }, { password: hashedPassword });

    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao redefinir senha." });
  }
};


module.exports = {
  loginUser,
  Userlogout,
  registerAdmin,
  getUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  getAllUsers,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  loginCustomer,
};