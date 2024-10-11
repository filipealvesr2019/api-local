const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
  url: String,
  price: Number,
  name: String,
});

const itemSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Certifique-se de que o modelo Product está configurado
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
 
  quantity: {
    type: Number,
    required: true,
  },
  variations: [variationSchema], // Array de variações
});

const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },
  items: [itemSchema], // Alterado para aceitar um array de itens
  status: {
    type: String,
    required: true,
    enum: ["RECEIVED", "PENDING"],
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Pix", "Cartao", "Dinheiro"],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

// Criar o modelo Order
const Order = mongoose.model("Order", orderSchema);

// Exportar o modelo Order
module.exports = Order;
