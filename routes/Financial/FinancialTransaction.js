const express = require('express');
const FinancialTransaction = require('../../models/Financial/FinancialTransaction');
const { default: mongoose } = require('mongoose');
const Category = require('../../models/categories/Categories');
const router = express.Router();


// Rota para criar uma nova receita
// Rota para criar uma nova receita

// Rota para criar uma nova despesa
router.post("/despesas", async (req, res) => {
  const { description, amount, relatedCart, category, adminID } = req.body;

  try {
      // Buscar o nome da categoria
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
          return res.status(400).json({ message: "Categoria não encontrada" });
      }

      const newTransaction = new FinancialTransaction({
          adminID,
          type: "despesa",
          description,
          amount,
          relatedCart,
          category,
          categoryName: categoryDoc.name
      });

      await newTransaction.save();
      res.status(201).json({ message: "Despesa criada com sucesso.", newTransaction });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar despesa", error });
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

// Rota para criar uma nova receita
router.post("/receitas", async (req, res) => {
  const { description, amount, relatedCart, category, adminID } = req.body;

  try {
      // Buscar o nome da categoria
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
          return res.status(400).json({ message: "Categoria não encontrada" });
      }

      const newTransaction = new FinancialTransaction({
          adminID,
          type: "receita",
          description,
          amount,
          relatedCart,
          category,
          categoryName: categoryDoc.name
      });

      await newTransaction.save();
      res.status(201).json({ message: "Receita criada com sucesso.", newTransaction });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar receita", error });
  }
});





router.get("/receitas/mes/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Pega o mês e o ano atual (ou o mês e ano que você deseja buscar)
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); // Início do mês
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)); // Fim do mês

    // Busca as receitas do adminID dentro do mês atual
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "receita",
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para este mês." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});




// Rota para buscar receitas por adminID
router.get("/despesas/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;
    
    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Busca as receitas do adminID
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "despesa"
    }).populate("relatedCart category"); // Popula campos referenciados

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma despesa encontrada para este adminID." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar despesas." });
  }
});



// Rota para obter todas as movimentações de receitas e despesas do mês por adminID
router.get('/transactions/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const transactions = await FinancialTransaction.find({
      adminID: adminID,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    }).exec();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações', error });
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



router.get('/profit-percentage/mes/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfMonthBeforePrevious = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Função para calcular lucro
    const calculateProfit = async (start, end) => {
      const transactions = await FinancialTransaction.find({
        adminID,
        status: 'RECEIVED',
        createdAt: { $gte: start, $lt: end }
      });

      let revenue = 0;
      let expense = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'receita') {
          revenue += transaction.amount;
        } else if (transaction.type === 'despesa') {
          expense += transaction.amount;
        }
      });

      return revenue - expense;
    };

    const currentMonthProfit = await calculateProfit(startOfCurrentMonth, endOfCurrentMonth);
    const previousMonthProfit = await calculateProfit(startOfPreviousMonth, endOfPreviousMonth);

    let percentageChange = 0;
    if (previousMonthProfit !== 0) {
      percentageChange = ((currentMonthProfit - previousMonthProfit) / Math.abs(previousMonthProfit)) * 100;
    } else {
      percentageChange = currentMonthProfit > 0 ? 100 : -100;
    }

    res.json({
      currentMonthProfit,
      previousMonthProfit,
      percentageChange: percentageChange.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const calculateProfitForDay = async (adminID, day) => {
  const startOfDay = new Date(day.setHours(0, 0, 0, 0));
  const endOfDay = new Date(day.setHours(23, 59, 59, 999));

  const transactions = await FinancialTransaction.find({
    adminID,
    status: 'RECEIVED',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  let receita = 0;
  let despesa = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === 'receita') {
      receita += transaction.amount;
    } else if (transaction.type === 'despesa') {
      despesa += transaction.amount;
    }
  });

  return receita - despesa; // Lucro do dia
};

// Rota para calcular a porcentagem de lucro
router.get('/lucro/dia/:adminID', async (req, res) => {
  const { adminID } = req.params;

  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Calcula o lucro do dia de hoje e do dia anterior
    const lucroHoje = await calculateProfitForDay(adminID, today);
    const lucroOntem = await calculateProfitForDay(adminID, yesterday);

    let percentageChange = 0;

    // Verifica se o lucro de ontem é zero
    if (lucroOntem !== 0) {
      // Calcula a porcentagem de diferença entre o lucro de ontem e hoje
      percentageChange = ((lucroHoje - lucroOntem) / Math.abs(lucroOntem)) * 100;
    } else {
      // Se o lucro de ontem for zero, baseia-se no lucro de hoje
      percentageChange = lucroHoje > 0 ? 100 : -100;
    }

    // Mensagem baseada na variação percentual
    let message = '';
    if (percentageChange > 0) {
      message = `Lucro aumentou ${percentageChange.toFixed(2)}% em relação ao dia anterior.`;
    } else if (percentageChange < 0) {
      message = `Lucro diminuiu ${Math.abs(percentageChange.toFixed(2))}% em relação ao dia anterior.`;
    } else {
      message = 'Nenhuma variação no lucro em relação ao dia anterior.';
    }

    // Resposta JSON com os dados
    res.json({
      lucroHoje,
      lucroOntem,
      percentageChange: percentageChange.toFixed(2),
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao calcular lucro');
  }
});




router.get('/despesas-por-mes/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Função para calcular despesas
    const calculateExpenses = async (start, end) => {
      const transactions = await FinancialTransaction.find({
        adminID,
        type: 'despesa',
        status: 'RECEIVED',
        createdAt: { $gte: start, $lt: end }
      });

      let totalExpenses = 0;
      transactions.forEach(transaction => {
        totalExpenses += transaction.amount;
      });

      return totalExpenses;
    };

    const currentMonthExpenses = await calculateExpenses(startOfCurrentMonth, endOfCurrentMonth);
    const previousMonthExpenses = await calculateExpenses(startOfPreviousMonth, endOfPreviousMonth);

    let percentageChange = 0;
    if (previousMonthExpenses !== 0) {
      percentageChange = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
    }

    res.json({
      currentMonthExpenses,
      previousMonthExpenses,
      percentageChange: percentageChange.toFixed(2) // Formata a porcentagem com duas casas decimais
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;