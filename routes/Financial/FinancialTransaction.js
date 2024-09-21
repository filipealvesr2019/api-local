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
  const { paymentDate, createdAt,  description, amount, relatedCart, category, adminID } = req.body;

  try {
      // Buscar o nome da categoria
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
          return res.status(400).json({ message: "Categoria não encontrada" });
      }

      const newTransaction = new FinancialTransaction({
          adminID,
          paymentDate,
          createdAt,
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
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para este mês." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});


router.get("/receitas/dia/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Pega a data atual (UTC)
    const now = new Date();
    
    // Define o início do dia (meia-noite)
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    
    // Define o final do dia (23:59:59)
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    // Busca as receitas do adminID no dia atual
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "receita",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para hoje." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});


router.get("/despesas/mes/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Obtém o ano e mês atuais
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // Note que getMonth() retorna 0 para janeiro e 11 para dezembro

    // Ajusta para o início e o fim do mês atual
    const startOfMonth = new Date(Date.UTC(year, month, 1)); // Início do mês
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59)); // Fim do mês

    // Busca as despesas do adminID dentro do mês atual
    const despesas = await FinancialTransaction.find({
      adminID: adminID,
      type: "despesa",
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente
    .populate("relatedCart category");

    if (!despesas.length) {
      return res.status(404).json({ message: "Nenhuma despesa encontrada para este mês." });
    }

    res.json(despesas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar despesas." });
  }
});

router.get("/receitas/tudo/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Busca todas as receitas associadas ao adminID
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "receita"
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente pela data de criação
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada." });
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


router.get("/despesas/tudo/:adminID", async (req, res) => {
  try {
    const { adminID } = req.params;

    // Verifica se adminID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

    // Busca todas as receitas associadas ao adminID
    const receitas = await FinancialTransaction.find({
      adminID: adminID,
      type: "despesa"
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente pela data de criação
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada." });
    }

    res.json(receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});



// Rota para obter todas as movimentações de receitas e despesas do mês por adminID
router.get('/transactions/mes/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const transactions = await FinancialTransaction.find({
      adminID: adminID,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      status: "RECEIVED"

    }).sort({ createdAt: -1 }).exec();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações', error });
  }
});
// Rota para obter todas as movimentações de receitas e despesas do dia por adminID
router.get('/transactions/dia/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;

    // Obter o início do dia (meia-noite)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Obter o final do dia (23:59:59)
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await FinancialTransaction.find({
      adminID: adminID,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      status: "RECEIVED"
    }).sort({ createdAt: -1 }).exec();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações', error });
  }
});
// Rota para obter todas as movimentações por adminID
router.get('/transactions/tudo/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;

    // Buscar todas as transações para o adminID
    const transactions = await FinancialTransaction.find({
      adminID: adminID,
      status: "RECEIVED" // Filtra por status se necessário
    }).sort({ createdAt: -1 }).exec();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações', error });
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


// Rota para atualizar o status de uma transação
router.put('/transactions/status/:adminID/:transactionID', async (req, res) => {
  try {
    const { adminID, transactionID } = req.params;
    const { status } = req.body;

    // Verifica se adminID e transactionID são ObjectIds válidos
    if (!mongoose.Types.ObjectId.isValid(adminID) || !mongoose.Types.ObjectId.isValid(transactionID)) {
      return res.status(400).json({ message: "ID de administrador ou de transação inválido." });
    }

    // Atualiza o status da transação com base no transactionID e adminID
    const updatedTransaction = await FinancialTransaction.findOneAndUpdate(
      { _id: transactionID, adminID: adminID },
      { status: status },
      { new: true } // Retorna o documento atualizado
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    res.status(200).json({ message: "Status atualizado com sucesso.", updatedTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar o status da transação." });
  }
});



// Rota para obter o valor total de despesas por mês filtrado por adminID
router.get("/despesas/mensais/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const despesasMensais = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID e tipo 'despesa'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          type: "despesa",
          status: "RECEIVED"
        }
      },
      {
        // Agrupa por ano e mês de paymentDate
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalDespesas: { $sum: "$amount" }, // Soma o valor total das despesas
        }
      },
      {
        // Ordena por ano e mês
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(despesasMensais);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter despesas mensais" });
  }
});










// Rota para obter o valor total de receitas por mês filtrado por adminID
router.get("/receitas/mensais/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const receitasMensais = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID e tipo 'despesa'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          type: "receita",
          status: "RECEIVED"

        }
      },
      {
        // Agrupa por ano e mês de paymentDate
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalReceitas: { $sum: "$amount" }, // Soma o valor total das despesas
        }
      },
      {
        // Ordena por ano e mês
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(receitasMensais);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter despesas mensais" });
  }
});












// Rota para obter despesas do dia filtradas por adminID e status 'RECEIVED'
router.get("/despesas-do-dia/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const despesasDoDia = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID, tipo 'despesa' e status 'RECEIVED'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          type: "despesa",
        }
      },
      {
        // Usa $expr e $dateToString para comparar apenas o dia, mês e ano da paymentDate
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              { $dateToString: { format: "%Y-%m-%d", date: new Date() } }
            ]
          }
        }
      },
      {
        // Agrupa para somar as despesas do dia
        $group: {
          _id: null,
          totalDespesas: { $sum: "$amount" }, // Soma o valor total das despesas
          despesas: { $push: "$$ROOT" } // Opcional: lista as despesas do dia
        }
      }
    ]);

    // Se não houver despesas, retorna um valor total de 0
    if (!despesasDoDia.length) {
      return res.json({ totalDespesas: 0, despesas: [] });
    }

    res.json(despesasDoDia[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter despesas do dia" });
  }
});


// Rota para obter despesas do dia filtradas por adminID e status 'RECEIVED'
router.get("/despesas/dia/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const despesasDoDia = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID, tipo 'despesa' e status 'RECEIVED'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          type: "despesa",
          status: "RECEIVED"
        }
      },
      {
        // Usa $expr e $dateToString para comparar apenas o dia, mês e ano da paymentDate
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              { $dateToString: { format: "%Y-%m-%d", date: new Date() } }
            ]
          }
        }
      },
      {
        // Agrupa para somar as despesas do dia
        $group: {
          _id: null,
          totalDespesas: { $sum: "$amount" }, // Soma o valor total das despesas
          despesas: { $push: "$$ROOT" } // Opcional: lista as despesas do dia
        }
      }
    ]);

    // Se não houver despesas, retorna um valor total de 0
    if (!despesasDoDia.length) {
      return res.json({ totalDespesas: 0, despesas: [] });
    }

    res.json(despesasDoDia[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter despesas do dia" });
  }
});




// Rota para obter receitas do dia filtradas por adminID e status 'RECEIVED'
router.get("/receitas/dia/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const receitasDoDia = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID, tipo 'despesa' e status 'RECEIVED'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          type: "receita",
          status: "RECEIVED"
        }
      },
      {
        // Usa $expr e $dateToString para comparar apenas o dia, mês e ano da paymentDate
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              { $dateToString: { format: "%Y-%m-%d", date: new Date() } }
            ]
          }
        }
      },
      {
        // Agrupa para somar as despesas do dia
        $group: {
          _id: null,
          totalReceitas: { $sum: "$amount" }, // Soma o valor total das despesas
          receitas: { $push: "$$ROOT" } // Opcional: lista as despesas do dia
        }
      }
    ]);

    // Se não houver despesas, retorna um valor total de 0
    if (!receitasDoDia.length) {
      return res.json({ totalReceitas: 0, receitas: [] });
    }

    res.json(receitasDoDia[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter despesas do dia" });
  }
});









// Rota para obter a diferença entre receitas e despesas por mês
router.get("/diferenca/mensal/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    const diferencaMensal = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID e status 'RECEIVED'
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          status: "RECEIVED"
        }
      },
      {
        // Agrupa por ano e mês de paymentDate
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalReceitas: {
            $sum: {
              $cond: [{ $eq: ["$type", "receita"] }, "$amount", 0]
            }
          },
          totalDespesas: {
            $sum: {
              $cond: [{ $eq: ["$type", "despesa"] }, "$amount", 0]
            }
          }
        }
      },
      {
        // Calcula a diferença entre receitas e despesas
        $project: {
          _id: 1,
          totalReceitas: 1,
          totalDespesas: 1,
          diferenca: { $subtract: ["$totalReceitas", "$totalDespesas"] } // Receita - Despesa
        }
      },
      {
        // Ordena por ano e mês
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(diferencaMensal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter a diferença mensal" });
  }
});

// Rota para obter a diferença entre receitas e despesas do dia
router.get('/diferenca/dia/:adminID', async (req, res) => {
  const { adminID } = req.params;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diferencaDiaria = await FinancialTransaction.aggregate([
      {
        // Filtra por adminID, status 'RECEIVED' e data do dia atual
        $match: {
          adminID: new mongoose.Types.ObjectId(adminID),
          status: "RECEIVED",
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        // Agrupa por tipo de transação
        $group: {
          _id: null,
          totalReceitas: {
            $sum: {
              $cond: [{ $eq: ["$type", "receita"] }, "$amount", 0]
            }
          },
          totalDespesas: {
            $sum: {
              $cond: [{ $eq: ["$type", "despesa"] }, "$amount", 0]
            }
          }
        }
      },
      {
        // Calcula a diferença entre receitas e despesas
        $project: {
          _id: 0,
          totalReceitas: 1,
          totalDespesas: 1,
          diferenca: { $subtract: ["$totalReceitas", "$totalDespesas"] } // Receita - Despesa
        }
      }
    ]);

    res.json(diferencaDiaria[0] || { totalReceitas: 0, totalDespesas: 0, diferenca: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao obter a diferença diária" });
  }
});


// Rota para deletar uma receita
router.delete('/receitas/:adminID/:id', async (req, res) => {
  const { adminID, id } = req.params;

  try {
    const receita = await FinancialTransaction.findOneAndDelete({
      _id: id,
      adminID: adminID,
    });

    if (!receita) {
      return res.status(404).json({ message: 'Receita não encontrada.' });
    }

    return res.status(200).json({ message: 'Receita deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});




// Rota para deletar uma despesa
router.delete('/despesas/:adminID/:id', async (req, res) => {
  const { adminID, id } = req.params;

  try {
    const receita = await FinancialTransaction.findOneAndDelete({
      _id: id,
      adminID: adminID,
    });

    if (!receita) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    return res.status(200).json({ message: 'Despesa deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});





router.get("/receitas-a-receber/mes/:adminID", async (req, res) => {
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
      },
      status: "PENDING"
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para este mês." });
    }

    // soma todas as receitas a receber
    const totalReceitas = receitas.reduce((acc, receita) => acc + receita.amount, 0)

    res.json({receitas, totalReceitas: totalReceitas});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});



router.get("/receitas-recebidas/mes/:adminID", async (req, res) => {
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
      },
      status: "RECEIVED"
    })
    .sort({ createdAt: -1 }) // Ordena de forma decrescente
    .populate("relatedCart category");

    if (!receitas.length) {
      return res.status(404).json({ message: "Nenhuma receita encontrada para este mês." });
    }

    // soma todas as receitas a receber
    const totalReceitas = receitas.reduce((acc, receita) => acc + receita.amount, 0)

    res.json({receitas, totalReceitas: totalReceitas.toFixed(2)});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receitas." });
  }
});

module.exports = router;