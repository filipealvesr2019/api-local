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
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  pixKey: { type: String, required: true },

  variations: [variationSchema], // Array de variações
});

// Correctly define the Cart model
const Cart = mongoose.model("Cart", cartSchema);

// Export the Cart model
module.exports = Cart;
