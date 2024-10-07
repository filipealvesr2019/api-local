const mongoose = require("mongoose");

const financialTransactionSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  type: { type: String, enum: ["receita", "despesa"], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  paymentDate: { type: Date }, // Data de pagamento/recebimento
  status: { type: String, enum: ["PENDING", "RECEIVED"], default: "PENDING" }, // Status da transação
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Referência à categoria
  categoryName: { 
    type: String 
  },
  createdAt: { type: Date, default: Date.now },
});

const FinancialTransaction = mongoose.model(
  "FinancialTransaction",
  financialTransactionSchema
);

module.exports = FinancialTransaction;
