const express = require('express');
const router = express.Router();
const Product = require('../models/products/product'); // Certifique-se de que o caminho para o modelo esteja correto

// Rota para cadastrar um produto
router.post('/products', async (req, res) => {
  try {
    const { name, category, variations } = req.body;

    // Validação simples (pode ser expandida conforme necessário)
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }

    // Criação de um novo produto
    const newProduct = new Product({
      name,
      category,
      variations, // A variação deve seguir o formato definido no schema
    });

    // Salvando o produto no banco de dados
    await newProduct.save();

    // Resposta de sucesso
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });
  } catch (error) {
    // Tratamento de erro
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

module.exports = router;
