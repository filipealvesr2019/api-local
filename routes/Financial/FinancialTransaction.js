const express = require('express');
const FinancialTransaction = require('../../models/Financial/FinancialTransaction');
const { default: mongoose } = require('mongoose');
const router = express.Router();


// Rota para criar uma nova receita
// Rota para criar uma nova receita
router.post("/receitas", async (req, res) => {
    const { description, amount, relatedCart, category, adminID } = req.body;


    try {
        const newTransaction = new FinancialTransaction({
            adminID,
            type: "receita",
            description,
            amount,
            relatedCart,
            category
        });

        await newTransaction.save();
        res.status(201).json({ message: "Receita criada com sucesso.", newTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar receita", error });
    }
});



// Rota para buscar receitas por adminID
router.get("/receitas/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;
    
    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Busca as receitas do adminID
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "receita"
    }).populate("relatedCart category"); // Popula campos referenciados

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para este adminID." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});










  // Rota para criar uma nova despesa
router.post("/despesas", async (req, res) => {
    const { description, amount, relatedCart, category, adminID } = req.body;


    try {
        const newTransaction = new FinancialTransaction({
            adminID,
            type: "despesa",
            description,
            amount,
            relatedCart,
            category
        });

        await newTransaction.save();
        res.status(201).json({ message: "Receita criada com sucesso.", newTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar receita", error });
    }
});



// // Rota para listar todas as despesas
// router.get("/despesas", async (req, res) => {
//     try {
//       const transactions = await FinancialTransaction.find({ type: "despesa" });
//       res.status(200).json(transactions);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Erro ao listar receitas", error });
//     }
//   });
  




// Rota para listar todas as movimentações (receitas e despesas) e verificar se são positivas ou negativas
router.get("/movimentacoes", async (req, res) => {
    try {
        const transactions = await FinancialTransaction.find();
        const categorizedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            isPositive: transaction.type === 'receita' ? transaction.amount > 0 : transaction.amount < 0
        }));
        res.status(200).json(categorizedTransactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar movimentações", error });
    }
});

// Rota para obter o saldo atual
router.get("/saldo", async (req, res) => {
    try {
        const receitas = await FinancialTransaction.aggregate([
            { $match: { type: 'receita' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const despesas = await FinancialTransaction.aggregate([
            { $match: { type: 'despesa' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalReceitas = receitas.length > 0 ? receitas[0].total : 0;
        const totalDespesas = despesas.length > 0 ? despesas[0].total : 0;
        const saldoAtual = totalReceitas - totalDespesas;

        res.status(200).json({ saldoAtual });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao calcular saldo", error });
    }
});

// Rota para listar despesas do mês atual
router.get("/transactions/expenses", async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
      const expenses = await FinancialTransaction.find({
        type: "despesa",
        paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
  
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Rota para listar receitas do mês atual
router.get("/transactions/income", async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
      const income = await FinancialTransaction.find({
        type: "receita",
        paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
  
      res.status(200).json(income);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  


  // Rota para obter o total de despesas do mês atual
router.get("/transactions/total/expenses", async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
      const totalExpenses = await FinancialTransaction.aggregate([
        { $match: { type: "despesa", paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      res.status(200).json({
        total: totalExpenses.length > 0 ? totalExpenses[0].total : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });



  // Rota para obter o total de receitas do mês atual
router.get("/transactions/total/income", async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
      const totalIncome = await FinancialTransaction.aggregate([
        { $match: { type: "receita", paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      res.status(200).json({
        total: totalIncome.length > 0 ? totalIncome[0].total : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
module.exports = router;