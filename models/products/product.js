const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  url: String,
  price: Number,
  name: String,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  variations: [variationSchema], // Array de variações
});

module.exports = mongoose.model('Product', productSchema);
