// models/Order.js
const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
  url: String,
  price: Number,
  name: String,
});

const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm", // Certifique-se de que o modelo UserForm está corretamente configurado
    required: true,
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm", // Ajuste conforme necessário
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["RECEIVED", "PENDING"], // Status do pedido
  },
  purchaseDate: { 
    type: Date, 
    required: true 
  },
  variations: [variationSchema], // Array de variações
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Pix", "Cartão de Crédito", "Dinheiro"], // Opções de pagamento permitidas
  },
});

// Criar o modelo Order
const Order = mongoose.model("Order", orderSchema);

// Exportar o modelo Order
module.exports = Order;
