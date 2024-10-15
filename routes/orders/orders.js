const express = require("express");
const router = express.Router();
const Order = require("../../models/orders/Order"); // Ajuste o caminho conforme necessário
const Cart = require("../../models/cart/cart");
const { default: mongoose } = require("mongoose");
const FinancialTransaction = require("../../models/Financial/FinancialTransaction");
const AdminAlarm = require("../../models/AdminAlarm/AdminAlarm");
const fs = require('fs');
const path = require('path');

router.post("/order", async (req, res) => {
  try {
    const { userID, storeID, paymentMethod, items } = req.body; // Extraia items do corpo da requisição

    // Log para verificar o que está sendo recebido


    // Mapeia os itens enviados na requisição
    const orderItems = items.map((item) => {
      // Preço total do item considerando a quantidade
      let itemTotal = item.price * item.quantity;

      // Se houver variações, soma o total das variações ao preço base (uma vez)
      if (item.variations && item.variations.length > 0) {
        const variationsTotal = item.variations.reduce(
          (variationAcc, variation) => variationAcc + variation.price,
          0
        );
        itemTotal += variationsTotal; // Adiciona o preço total das variações
      }

      return {
        productID: item.productID,
        name: item.name,
        price: item.price,
        quantity: item.quantity, // Use a quantidade da requisição
        imageUrl: item.imageUrl, // Certifique-se de que imageUrl está sendo incluído
      };
    });

    // Calcula o total do pedido
    const totalOrders = orderItems.reduce((acc, item) => {
      let itemTotal = item.price * item.quantity;

      // Se houver variações, soma o total das variações ao preço base (uma vez)
      if (item.variations && item.variations.length > 0) {
        const variationsTotal = item.variations.reduce(
          (variationAcc, variation) => variationAcc + variation.price,
          0
        );
        itemTotal += variationsTotal; // Adiciona o preço total das variações
      }

      return acc + itemTotal; // Soma o total do item ao acumulador
    }, 0);

    // Criar um novo pedido
    const newOrder = new Order({
      userID,
      storeID,
      items: orderItems, // Definindo os itens no pedido
      status: "PENDING",
      purchaseDate: new Date(),
      paymentMethod,
      totalAmount: totalOrders, // Define o totalAmount do pedido
    });

    // Salvar o pedido no banco de dados
    await newOrder.save();

    // Retornar uma resposta bem-sucedida
    return res
      .status(201)
      .json({ message: "Pedido finalizado com sucesso!", order: newOrder });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao finalizar o pedido.", error: error.message });
  }
});


// Rota para buscar todas as vendas de um carrinho por storeID
router.get("/admin/vendas/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Buscar todas as vendas que correspondem ao storeID
    const vendas = await Order.find({ storeID }).sort({ purchaseDate: -1 });

    // Se não houver vendas, retornar uma mensagem informativa
    if (vendas.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma venda encontrada para esta loja." });
    }

    // Retornar as vendas encontradas
    res.status(200).json(vendas);
  } catch (error) {
    // Se houver um erro na consulta, retornar o erro
    res.status(500).json({ message: "Erro ao buscar vendas", error });
  }
});

// Rota para obter um pedido específico
router.get("/admin/order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Encontre o pedido pelo ID
    const order = await Order.findById(orderId)
      .populate("userID") // Preencher dados do usuário, se necessário
      .populate("storeID") // Preencher dados da loja, se necessário
      .populate("items.productID"); // Preencher dados do produto

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    // Retornar o pedido encontrado
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar o pedido." });
  }
});

// Rota para atualizar o status da compra para "RECEIVED" ou "PENDING"
router.put("/compras/:orderId/status", async (req, res) => {
  const { orderId } = req.params; // ID da compra passada como parâmetro na URL
  const { status, adminID } = req.body; // Status enviado no corpo da requisição

  // Verifica se o adminID é válido
  if (!mongoose.Types.ObjectId.isValid(adminID)) {
    return res.status(400).json({ message: "ID de administrador inválido." });
  }

  // Verifica se o status enviado é válido
  const validStatuses = ["RECEIVED", "PENDING"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ message: "Status inválido. Use 'RECEIVED' ou 'PENDING'." });
  }

  try {
    // Buscar a compra (carrinho) existente
    const order = await Order.findById(orderId);

    // Se a compra não for encontrada, retorne um erro
    if (!order) {
      return res.status(404).json({ message: "Compra não encontrada" });
    }

    // Se o status anterior era "RECEIVED" e o novo status não for "RECEIVED", apagar a receita associada
    if (order.status === "RECEIVED" && status !== "RECEIVED") {
      await FinancialTransaction.findOneAndDelete({
        orderID: order._id,
        type: "receita",
      });
    }

    // Atualizar o status da compra
    order.status = status;
    await order.save();
    console.log(order._id)

    // Se o novo status for "RECEIVED", criar uma nova entrada de receita
    if (status === "RECEIVED") {
      const newTransaction = new FinancialTransaction({
        adminID,
        type: "receita",
        description: `Receita de venda`,
        amount: order.totalAmount,
        status: "RECEIVED",
        orderID: order._id,
        createdAt: new Date(),
        categoryName: order.category,
        paymentDate: new Date(),
        
      });
      await newTransaction.save();
    }

    // Retorna o carrinho atualizado como resposta
    res
      .status(200)
      .json({ message: `Status atualizado para '${status}'`, order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao atualizar status da compra", error });
  }
});




// Rota para listar os sons na pasta 'public/alarms' e destacar o som escolhido pelo adminID
router.get('/alarms/list/:adminID', async (req, res) => {
  const { adminID } = req.params;
  
  try {
    // Ajustar o caminho para a pasta 'public/alarms'
    const alarmsDirectory = path.join(__dirname, '../../public/alarms');

    // Ler os arquivos da pasta de alarmes
    fs.readdir(alarmsDirectory, async (err, files) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao listar os sons.', error: err.message });
      }

      // Filtrar apenas os arquivos de som (ex.: .mp3, .wav)
      const soundFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));

      // Buscar o alarme configurado pelo adminID
      const adminAlarm = await AdminAlarm.findOne({ adminID });

      // Se o admin tem um alarme configurado, destaque-o
      const selectedAlarm = adminAlarm ? adminAlarm.alarmSound : null;

      // Retornar a lista de arquivos de som e o som selecionado pelo admin
      res.status(200).json({
        sounds: soundFiles,
        selectedAlarm,  // Som selecionado pelo admin
        isAlarmActive: adminAlarm ? adminAlarm.isAlarmActive : false // Estado de ativação
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar os sons.', error: error.message });
  }
});

// Rota para salvar a escolha do alarme e ativar/desativar o alarme
router.post('/alarms', async (req, res) => {
  try {
    const { adminID, alarmSound, isAlarmActive } = req.body;

    // Verificar se o admin já tem um alarme configurado
    let adminAlarm = await AdminAlarm.findOne({ adminID });

    if (adminAlarm) {
      // Se o admin já tem um alarme escolhido, atualize o alarme e o estado de ativação
      adminAlarm.alarmSound = alarmSound;
      adminAlarm.isAlarmActive = isAlarmActive;
      await adminAlarm.save();
    } else {
      // Se não, crie um novo registro com a escolha do alarme e o estado de ativação
      adminAlarm = new AdminAlarm({ adminID, alarmSound, isAlarmActive });
      await adminAlarm.save();
    }

    res.status(200).json({ message: 'Alarme salvo com sucesso!', alarm: adminAlarm });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar o alarme.', error: error.message });
  }
});



// Rota para tocar um som específico
router.get('/audio/play/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../public/alarms', filename);

  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado.' });
  }

  // Enviar o arquivo de áudio como resposta
  res.sendFile(filePath);
});


// Rota para selecionar um alarme como alarme inicial
router.post('/alarms/select', async (req, res) => {
  try {
    const { adminID, alarmSound } = req.body;

    // Verificar se o admin já tem um alarme configurado
    let adminAlarm = await AdminAlarm.findOne({ adminID });

    if (adminAlarm) {
      // Atualizar o alarme selecionado
      adminAlarm.alarmSound = alarmSound;
      await adminAlarm.save();
    } else {
      // Se não, crie um novo registro com a escolha do alarme
      adminAlarm = new AdminAlarm({ adminID, alarmSound, isAlarmActive: false });
      await adminAlarm.save();
    }

    res.status(200).json({ message: 'Alarme selecionado com sucesso!', alarm: adminAlarm });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao selecionar o alarme.', error: error.message });
  }
});

module.exports = router;
