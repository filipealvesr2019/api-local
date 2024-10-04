// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../../models/orders/Order"); // Ajuste o caminho conforme necessário
const Cart = require("../../models/cart/cart");

// Rota para criar um novo pedido a partir de múltiplos produtos no carrinho
router.post("/", async (req, res) => {
    const { userID, storeID, paymentMethod } = req.body;
  
    try {
      // Buscar os produtos no carrinho do usuário
      const cartProducts = await Cart.find({ userID, status: "PENDING" });
  
      // Verifica se existem produtos no carrinho
      if (cartProducts.length === 0) {
        return res.status(400).json({ message: "Não há produtos no carrinho." });
      }
  
      // Mapeia os produtos do carrinho para criar os pedidos
      const orders = cartProducts.map(product => ({
        userID,
        storeID,
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl,
        price: product.price,
        totalAmount: product.totalAmount,
        quantity: product.quantity,
        status: "PENDING", // ou outro status apropriado
        purchaseDate: new Date(),
        variations: product.variations,
        paymentMethod,
      }));
  
      // Salvar todos os pedidos
      const createdOrders = await Order.insertMany(orders);
  
      // Opcional: Remover os produtos do carrinho ou atualizar o status
      await Cart.updateMany({ userID, status: "PENDING" }, { status: "COMPLETED" });
  
      res.status(201).json(createdOrders);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Erro ao criar pedido." });
    }
  });
  

module.exports = router;
