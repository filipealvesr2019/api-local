const mongoose = require("mongoose");

const financialTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["receita", "despesa"], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  relatedCart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  paymentDate: { type: Date },  // Data de pagamento/recebimento
  status: { type: String, enum: ['PENDING', 'RECEIVED'], default: 'PENDING' },  // Status da transação
  category: { type: String },  // Categoria (ex: fornecedores, vendas, etc)
  createdAt: { type: Date, default: Date.now },
});

const FinancialTransaction = mongoose.model("FinancialTransaction", financialTransactionSchema);

module.exports = FinancialTransaction;
