const express = require('express');
const router = express.Router();
const Product = require('../models/products/product'); // Certifique-se de que o caminho para o modelo esteja correto

// Rota para cadastrar um produto
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, imageUrl,  variations } = req.body;

    // Validação simples (pode ser expandida conforme necessário)
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }

    // Criação de um novo produto
    const newProduct = new Product({
      name,
      category,
      price,
      imageUrl,
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
// Rota para listar todos os produtos com suas variações
router.get('/products', async (req, res) => {
    try {
      const products = await Product.find(); // Busca todos os produtos
      res.status(200).json(products); // Retorna todos os produtos em formato JSON
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

// Rota para obter os detalhes de um produto pelo ID
router.get('/product/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id); // Busca o produto pelo ID
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(product); // Retorna os detalhes do produto em formato JSON
  } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});


// Rota para visualizar detalhes de um produto específico
router.get('/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id); // Busca o produto pelo ID
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      res.status(200).json(product); // Retorna o produto em formato JSON
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ error: 'Failed to fetch product details.' });
    }
  });

  
module.exports = router;
