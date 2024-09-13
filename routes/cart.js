const express = require("express");
const Cart = require("../models/cart/cart");
const Product = require("../models/products/product");
const UserForm = require("../models/UserForm");
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

// Rota para buscar pedidos por adminID
router.get('/sales/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    
    // Buscar produtos pelo adminID
    const sales = await Cart.find({ adminID });

    if (!sales.length) {
      return res.status(404).json({ message: "Nenhum pedido encontrado para este adminID" });
    }

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os pedidos' });
  }
});

module.exports = router;