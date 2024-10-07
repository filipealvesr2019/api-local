const express = require("express");
const router = express.Router();
const Order = require("../../models/orders/Order"); // Ajuste o caminho conforme necessário
const Cart = require("../../models/cart/cart");

router.post("/order", async (req, res) => {
  try {
    const {
      userID,
      storeID,
      paymentMethod,
    } = req.body;

    // Encontre os itens do carrinho para o usuário
    const cartItems = await Cart.find({ userID });

    // Mapeia os itens do carrinho para o formato esperado para o pedido
    const items = cartItems.map(item => {
      // Preço total do item considerando a quantidade
      let itemTotal = item.price * item.quantity;

      // Se houver variações, soma o total das variações ao preço base (uma vez)
      if (item.variations && item.variations.length > 0) {
        const variationsTotal = item.variations.reduce((variationAcc, variation) => variationAcc + variation.price, 0);
        itemTotal += variationsTotal; // Adiciona o preço total das variações
      }

      return {
        productID: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl // Certifique-se de que imageUrl está sendo incluído
      };
    });

    // Calcula o total do pedido
    const totalOrders = cartItems.reduce((acc, item) => {
      let itemTotal = item.price * item.quantity;

      // Se houver variações, soma o total das variações ao preço base (uma vez)
      if (item.variations && item.variations.length > 0) {
        const variationsTotal = item.variations.reduce((variationAcc, variation) => variationAcc + variation.price, 0);
        itemTotal += variationsTotal; // Adiciona o preço total das variações
      }

      return acc + itemTotal; // Soma o total do item ao acumulador
    }, 0);

    // Criar um novo pedido
    const newOrder = new Order({
      userID,
      storeID,
      items, // Definindo os itens no pedido
      status: "PENDING",
      purchaseDate: new Date(),
      paymentMethod,
      totalAmount: totalOrders, // Define o totalAmount do pedido
    });

    // Salvar o pedido no banco de dados
    await newOrder.save();

    // Retornar uma resposta bem-sucedida
    return res.status(201).json({ message: "Pedido finalizado com sucesso!", order: newOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao finalizar o pedido.", error: error.message });
  }
});



// Rota para buscar todas as vendas de um carrinho por storeID
router.get("/admin/vendas/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Buscar todas as vendas que correspondem ao storeID
    const vendas = await Order.find({ storeID }).sort({ purchaseDate: -1 });;

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



module.exports = router;
