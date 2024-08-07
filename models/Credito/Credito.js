const mongoose = require("mongoose");

const CreditoSchema = new mongoose.Schema({
  billingType: {
    type: String,
  },
  custumerId: {
    type: String,
  },
  customer: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },

  value: { type: Number, required: true },
  format: {
    type: String,
    enum: ["ALL", "IMAGE", "PAYLOAD"],
  },
  createdAt: { type: Date, default: Date.now }, // Campo para armazenar a data de criação


  expirationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  allowsMultiplePayments: {
    type: Boolean, // Alterado para Boolean
    required: true,
    default: true, // Padrão definido como true
  },
  externalReference: {
    type: String,
  },
  payload: {
    type: String,
  },
  encodedImage: {
    type: String,
  },
  decodedImage: {
    type: String,
  },
  id: {
    type: String,
  },
 
 
  createdAt: { type: Date, default: Date.now }, // Campo para armazenar a data de criação

  trackingCode: { type: String },
  totalQuantity: {
    type: Number,
    default: 1 // Defina o valor padrão como "PENDENTE" ou outro valor apropriado
  },
  status: {
    type: String,
    default: "PENDING" // Defina o valor padrão como "PENDENTE" ou outro valor apropriado
  }
});



const Credito = mongoose.model("Credito", CreditoSchema);

module.exports = Credito;