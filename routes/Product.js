const express = require('express');
const router = express.Router();
const Product = require('../models/products/product'); // Certifique-se de que o caminho para o modelo esteja correto
const { default: mongoose } = require('mongoose');

// Rota para cadastrar um produto
router.post('/products', async (req, res) => {
  try {
    const { adminID, storeID,  name, category, price, imageUrl,  variations, categoryName } = req.body;

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
      categoryName,
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









// Rota para obter os detalhes de um produto pelo ID
router.get('/product/:name/:id', async (req, res) => {
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

// // Rota para obter os detalhes de um produto pelo ID e renderizar a página
// router.get('/product/:name/:id', async (req, res) => {
//   try {
//       const product = await Product.findById(req.params.id); // Busca o produto pelo ID
//       if (!product) {
//           return res.status(404).send('Produto não encontrado');
//       }

//       // Renderizar a página do produto com as meta tags dinâmicas
//       res.render('product', {
//         product, // Enviar o produto para o template
//         metaTitle: product.name,
//         metaDescription: product.description || 'Descrição do produto não disponível.',
//         metaImageUrl: product.imageUrl || '/default-image.jpg' // Adicionar a URL da imagem do produto
//       });
//   } catch (error) {
//       console.error('Erro ao buscar detalhes do produto:', error);
//       res.status(500).send('Erro ao buscar detalhes do produto.');
//   }
// });

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
    const produtos = await Product.find({ storeID: req.params.storeID }).select('-adminID');;

    if (produtos.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado para esta loja.' });
    }

    // Retorna a lista de produtos
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar os produtos', error });
  }
});


router.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find(); // Busca todos os produtos
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter produtos",
    });
  }
});



module.exports = router;