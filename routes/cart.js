const express = require("express");
const Cart = require("../models/cart/cart");
const Product = require("../models/products/product");
const UserForm = require("../models/UserForm");
const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const QRCode = require('qrcode');
const Pix = require("../models/Pix/Pix");
const PixQRCode = require("../models/Pix/QRCodePIX");

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
      adminID: User.adminID,
      userID: User.userID,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      totalAmount: totalAmount,
      variations: variations, // Array de variações
      pixKey: "",  // Isso pode ser atualizado depois se necessário

    });

    // Salvar pedido no banco de dados
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the order" });
  }
});



router.post('/qr-code', async (req, res) => {
  const { pixKey } = req.body;

  if (!pixKey) {
    return res.status(400).send('Pix Key is required');
  }

  try {
    // Gera o QR Code
    const qrCodeUrl = await QRCode.toDataURL(pixKey);

    // Salva o PIX e o QR Code no banco de dados
    const newPix = new PixQRCode({ pixKey, qrCodeUrl });
    await newPix.save();

    res.status(201).send({ qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;