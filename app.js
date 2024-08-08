require('dotenv').config();
const { ClerkExpressRequireAuth } = require ('@clerk/clerk-sdk-node')
const express  = require ('express');
const cors = require('cors'); // Importando o módulo cors

const bodyParser = require('body-parser');
const port = process.env.PORT || 3002;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const admin = require('./routes/admin');
const Ecommerce = require('./routes/Ecommerce');
const Customer = require('./routes/Customer');
const Monthly = require('./routes/subscriptions/basic/monthly');
const superAdmin = require('./routes/superAdmin');
const Product = require('./routes/Product');


app.use(bodyParser.json());
app.use(cookieParser());
// Configurações e middlewares
app.use(cors({ origin: "*"}));
// Use the strict middleware that raises an error when unauthenticated
app.get(
  '/protected-endpoint',
  ClerkExpressRequireAuth({
    // Add options here
    // See the Middleware options section for more details
  }),
  (req, res) => {
    res.send('vc esta autorisado')
    res.json(req.auth);
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});
app.use('/api', superAdmin);
app.use('/api', admin);
app.use('/api', Ecommerce);
app.use('/api', Customer);




app.use('/api', Monthly);

app.use('/api', Product);




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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});