const express = require('express');
const router = express.Router();
const Product = require('../models/products/product'); // Certifique-se de que o caminho para o modelo esteja correto
const { default: mongoose } = require('mongoose');

// Rota para cadastrar um produto
router.post('/products', async (req, res) => {
  try {
    const { adminID, storeID,  name, category, price, imageUrl,  variations } = req.body;

    // Validação simples (pode ser expandida conforme necessário)
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }

    // Criação de um novo produto
    const newProduct = new Product({
      adminID,
      storeID,
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


// Rota para buscar um produto específico pelo storeID e productID
router.get('/produto/loja/:storeID/:productID', async (req, res) => {
  try {
    const { storeID, productID } = req.params;
    
    // Busca o produto pelo storeID e pelo productID
    const produto = await Product.findOne({ storeID, _id: productID });

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado para esta loja.' });
    }

    // Retorna o produto específico
    res.json(produto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto', error });
  }
});

  // Rota para obter todos os produtos para um adminID específico

// Rota para buscar produtos por adminID
router.get('/products/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    
    // Buscar produtos pelo adminID
    const products = await Product.find({ adminID });

    if (!products.length) {
      return res.status(404).json({ message: "Nenhum produto encontrado para este adminID" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os produtos' });
  }
});


// Rota para buscar todos os produtos pelo storeID
router.get('/produtos/loja/:storeID', async (req, res) => {
  try {
    // Busca todos os produtos pelo storeID
    const produtos = await Product.find({ storeID: req.params.storeID });

    if (produtos.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado para esta loja.' });
    }

    // Retorna a lista de produtos
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar os produtos', error });
  }
});

module.exports = router;