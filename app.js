require('dotenv').config();
const express  = require ('express');
const cors = require('cors'); // Importando o módulo cors
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3002;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const dotenv = require('dotenv');
const { createServer } = require ("node:http");
const { Server } = require('socket.io');


const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const admin = require('./routes/admin');
const Ecommerce = require('./routes/Ecommerce');
const Customer = require('./routes/Customer');
const Monthly = require('./routes/subscriptions/basic/monthly');
const superAdmin = require('./routes/superAdmin');
const Product = require('./routes/Product');
const User = require('./routes/User');
const cart = require('./routes/cart');
const whatsapp = require('./routes/chatpro/Whatsapp');
const FinancialTransaction = require('./routes/Financial/FinancialTransaction');

const Categories = require('./routes/categories/Categories');
const MetaAPI = require('./routes/Meta API/whatsapp');
const cronJobs = require('./routes/cronJobs');
const ordersRouter = require("./routes/orders/orders"); // Ajuste o caminho conforme necessário
const QRCodePIX = require("./routes/QRCodePIX/QRCodePIX"); // Ajuste o caminho conforme necessário
const Chat = require("./routes/chat/Chat"); // Ajuste o caminho conforme necessário




const session = require('express-session');
const passport = require('passport');



app.use(bodyParser.json());
app.use(cookieParser());
// Configurações e middlewares
app.use(cors({ origin: "*"}));

// Create HTTP server

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5002", // Permita a origem específica ou use "*" para todas as origens
    methods: ["GET", "POST"], // Especifique os métodos permitidos
    credentials: true // Permita credenciais, se necessário
  }
});
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("clientMessage", (data) => {
      console.log("Mensagem recebida do cliente:", data);
      io.emit("clientMessage", {
          from: data.from,
          message: data.message,
      });
  });

  socket.on("sendAdminMessage", (adminMessage) => {
      io.emit("adminMessage", {
          message: adminMessage,
      });
  });

  socket.on("disconnect", () => {
      console.log("A user disconnected");
  });
});

// Middleware para fazer o 'io' estar disponível nas rotas
app.use((req, res, next) => {
  req.io = io; // Disponibilizar o 'io' nas requisições
  next();
});
app.use('/alarms', express.static('public/alarms'));


// Use the strict middleware that raises an error when unauthenticated

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies em produção

}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/api', superAdmin);
app.use('/api', admin);
app.use('/api', Ecommerce);
app.use('/api', Customer);
app.use('/api', Chat);



app.use('/api', Monthly);
app.use('/api', Product);
app.use('/api', User);
app.use('/api', cart);
app.use('/api', whatsapp);
app.use('/api', FinancialTransaction);
app.use('/api', Categories);

app.use('/api', MetaAPI);
app.use('/api', cronJobs)
app.use("/api", ordersRouter); // Adicione esta linha
app.use("/api", QRCodePIX); // Adicione esta linha


// Definir o template engine como EJS
app.set('view engine', 'ejs');

// Definir o diretório onde os templates estão localizados
app.set('views', path.join(__dirname, 'views'));




dotenv.config();
require('./passport-config'); // Configuração do Passport


app.get('/', (req, res) => {
  res.send('app, running!');
});
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Acesso à variável de ambiente MONGODB_URI do arquivo .env
const uri = process.env.MONGODB_URI;

const options = {
  serverSelectionTimeoutMS: 30000, // 30 segundos
  socketTimeoutMS: 30000 // 30 segundos
};
// Conexão com o banco de dados
mongoose.connect(uri, options).then(() => {
  console.log('Conectado ao banco de dados');
}).catch((error) => {
  console.error('Erro de conexão com o banco de dados:', error);
});


server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});