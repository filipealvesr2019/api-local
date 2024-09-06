const express = require("express");
const Cart = require("../models/cart/cart");
const Product = require("../models/products/product");
const Customer = require("../models/Customer");
const router = express.Router();
const { ObjectId } = require('mongoose').Types;

router.post("/cart/:customerId/:productId", async (req, res) => {
  try {
    const { customerId, productId } = req.params;

    // Verifique se o customerId e o productId são válidos
    if (!ObjectId.isValid(customerId) || !ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid customer ID or product ID" });
    }

    // Buscar cliente no banco de dados
    const customer = await Customer.findOne({ customerId: customerId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Buscar produto no banco de dados
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Criar novo pedido
    const newOrder = new Cart({
      customerId: customer._id,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      variations: product.variations,
    });

    // Salvar pedido no banco de dados
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the order" });
  }
});

module.exports = router;
