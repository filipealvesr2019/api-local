const mongoose = require("mongoose");
const variationSchema = new mongoose.Schema({
    url: String,
    price: Number,
    name: String,
  });
const cartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    variations: [variationSchema], // Array de variações
})

const Cart = ("Cart", cartSchema);
module.exports = Cart;