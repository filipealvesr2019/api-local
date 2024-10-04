const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
  url: String,
  price: Number,
  name: String,
});

const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },

  storeID:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String
    },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: { type: Number, required: true },
  status: { type: String, required: true }, // Campo para o status da compra
  purchaseDate: { type: Date, required: true }, // Data da compra
  variations: [variationSchema], // Array de variações
  //  paymentMethod: {
  //   type: String,
  //   required: true,
  //   enum: ["Pix", "Cartão de Credito", "Dinheiro"], // Opções de pagamento permitidas
  // }
});

// Correctly define the Cart model
const Cart = mongoose.model("Cart", cartSchema);

// Export the Cart model
module.exports = Cart;
