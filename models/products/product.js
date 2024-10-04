const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  url: String,
  price: Number,
  name: String,
});

const productSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  storeID:  {type: String, required: true },
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Referência à categoria
  categoryName: { 
    type: String 
  },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  variations: [variationSchema], // Array de variações
});

module.exports = mongoose.model('Product', productSchema);
