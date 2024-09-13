const express = require("express");
const Cart = require("../models/cart/cart");
const Product = require("../models/products/product");
const UserForm = require("../models/UserForm");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { ObjectId } = require('mongoose').Types;

router.post("/cart/:userID/:productId", async (req, res) => {
  try {
    const { userID, productId } = req.params;
    const { variations, quantity } = req.body; // Array de variações

    // Verifique se o customerId e o productId são válidos
    if (!ObjectId.isValid(userID) || !ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid customer ID or product ID" });
    }

    // Buscar cliente no banco de dados
    const User = await UserForm.findOne({ userID: userID });
    if (!User) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Buscar produto no banco de dados
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Verificar se o quantity é um número válido
    if(isNaN(quantity) || quantity <= 0){
      return res.status(400).json({error: 'Invalid quantity'})
    }
    let variationTotal = 0;
    if(variations && Array.isArray(variations)){
      variationTotal = variations.reduce((sum, variation) => {
        return sum + (variation. price || 0)
      }, 0)
    }
    let total = product.price * quantity;
    let totalAmount = total + variationTotal
    // Criar novo pedido com as variações fornecidas
    const newOrder = new Cart({
      storeID: User.storeID,
      userID: User.userID,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      totalAmount: totalAmount,
      status: 'PENDING', // Campo para o status da compra
      purchaseDate: new Date(), // Preenche com a data e hora atuais
      variations: variations, // Array de variações

    });

    // Salvar pedido no banco de dados
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the order" });
  }
});



// Rota para obter os detalhes de um produto pelo ID
router.get('/sale/:id', async (req, res) => {
  try {
      const sales = await Cart.findById(req.params.id); // Busca o produto pelo ID
      if (!sales) {
          return res.status(404).json({ error: 'sale not found' });
      }
      res.status(200).json(sales); // Retorna os detalhes do produto em formato JSON
  } catch (error) {
      console.error('Error fetching sale details:', error);
      res.status(500).json({ error: 'Failed to fetch sale details.' });
  }
});





// Rota para buscar todas as vendas de um carrinho por storeID
router.get("/user/vendas/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Buscar todas as vendas que correspondem ao storeID
    const vendas = await Cart.find({ storeID });

    // Se não houver vendas, retornar uma mensagem informativa
    if (vendas.length === 0) {
      return res.status(404).json({ message: "Nenhuma venda encontrada para esta loja." });
    }

    // Retornar as vendas encontradas
    res.status(200).json(vendas);
  } catch (error) {
    // Se houver um erro na consulta, retornar o erro
    res.status(500).json({ message: "Erro ao buscar vendas", error });
  }
});


// Rota para buscar todas as vendas de um carrinho por storeID
router.get("/admin/vendas/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Buscar todas as vendas que correspondem ao storeID
    const vendas = await Cart.find({ storeID });

    // Se não houver vendas, retornar uma mensagem informativa
    if (vendas.length === 0) {
      return res.status(404).json({ message: "Nenhuma venda encontrada para esta loja." });
    }

    // Retornar as vendas encontradas
    res.status(200).json(vendas);
  } catch (error) {
    // Se houver um erro na consulta, retornar o erro
    res.status(500).json({ message: "Erro ao buscar vendas", error });
  }
});




// Rota para calcular o total ganho no mesmo dia
router.get("/vendas/total-dia/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Pega a data atual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define a hora para o início do dia

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Data do próximo dia para o intervalo

    // Filtra por storeID, status 'received' e compras feitas no mesmo dia
    const vendasDoDia = await Cart.aggregate([
      {
        $match: {
          storeID: new mongoose.Types.ObjectId(storeID),
          status: "RECEIVED",
          purchaseDate: {
            $gte: today, // Compras feitas hoje
            $lt: tomorrow, // Exclui o próximo dia
          },
        },
      },
      {
        $group: {
          _id: null, // Não agrupamos por nenhum campo, apenas somamos
          totalGanho: { $sum: "$totalAmount" }, // Soma os totalAmount
        },
      },
    ]);

    if (vendasDoDia.length === 0) {
      return res.status(200).json({ totalGanho: 0 });
    }

    // Retorna o total ganho
    res.status(200).json({ totalGanho: vendasDoDia[0].totalGanho });
  } catch (error) {
    console.error("Erro ao calcular o total de vendas do dia:", error);
    res.status(500).json({ message: "Erro ao calcular o total", error });
  }
});

router.get("/vendas/total-mes/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Pega o primeiro e o último dia do mês atual
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Filtra por storeID, status 'RECEIVED' e compras feitas no mês atual
    const vendasDoMes = await Cart.aggregate([
      {
        $match: {
          storeID: new mongoose.Types.ObjectId(storeID),
          status: "RECEIVED", // Certifique-se de que o status é exatamente "RECEIVED"
          purchaseDate: {
            $gte: firstDayOfMonth, // Compras a partir do primeiro dia do mês
            $lte: lastDayOfMonth, // Compras até o último dia do mês
          },
        },
      },
      {
        $group: {
          _id: null, // Não agrupamos por nenhum campo, apenas somamos
          totalGanho: { $sum: "$totalAmount" }, // Soma os totalAmount, que é o valor total da compra
        },
      },
    ]);

    // Verifica se há vendas no mês
    if (vendasDoMes.length === 0) {
      return res.status(200).json({ totalGanho: 0 });
    }

    // Retorna o total ganho no mês
    res.status(200).json({ totalGanho: vendasDoMes[0].totalGanho });
  } catch (error) {
    console.error("Erro ao calcular o total de vendas do mês:", error);
    res.status(500).json({ message: "Erro ao calcular o total do mês", error });
  }
});


module.exports = router;