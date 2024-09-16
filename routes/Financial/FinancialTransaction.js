const express = require('express');
const FinancialTransaction = require('../../models/Financial/FinancialTransaction');
const router = express.Router();


// Rota para criar uma nova receita
// Rota para criar uma nova receita
router.post("/receitas", async (req, res) => {
    const { description, amount, relatedCart, category } = req.body;


    try {
        const newTransaction = new FinancialTransaction({
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




// Rota para listar todas as receitas
router.get("/receitas", async (req, res) => {
    try {
      const transactions = await FinancialTransaction.find({ type: "receita" });
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao listar receitas", error });
    }
  });
  











  // Rota para criar uma nova despesa
router.post("/despesas", async (req, res) => {
    const { description, amount, relatedCart, category } = req.body;


    try {
        const newTransaction = new FinancialTransaction({
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



// Rota para listar todas as despesas
router.get("/despesas", async (req, res) => {
    try {
      const transactions = await FinancialTransaction.find({ type: "despesa" });
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao listar receitas", error });
    }
  });
  




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


  
module.exports = router;