const mongoose = require("mongoose");
const cron = require("node-cron");
const express = require("express");
const { SitemapStream } = require('sitemap');
const fs = require('fs');
const Product = require("../models/products/product");

const Ecommerce = require("../models/Ecommerce");



const router = express.Router();




const formatProductNameForURL = (name) => {
  return name
    .normalize("NFD") // Normaliza a string para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
    .toLowerCase() // Converte para letras minúsculas
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/[^\w\-]+/g, ""); // Remove caracteres não alfanuméricos (exceto hífens)
};




// Função para gerar o sitemap
const generateSitemap = async () => {
  try {
    const products = await Product.find({});
    const subdomain = await Ecommerce.find({});

    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
  
   
      ...subdomain.map(subdomain => ({
        url: `/loja/${encodeURIComponent(subdomain.dominio)}`,
        changefreq: 'weekly',
        priority: 0.7,
      })),
      ...products.map(product => ({
        url: `/user/product/${formatProductNameForURL(product.name)}/${product.id}`,
        changefreq: 'weekly',
        priority: 0.7,
      })),


    ];

    const stream = new SitemapStream({ hostname: 'https://front-end-local-9nsb.vercel.app/' });

    const writeStream = fs.createWriteStream('./public/sitemap.xml');
    stream.pipe(writeStream);

    links.forEach(link => stream.write(link));
    stream.end();

    console.log('Sitemap gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar o sitemap:', error);
  }
};

// Rota para acessar o sitemap
router.get('/sitemap.xml', (req, res) => {
  res.sendFile(__dirname + '/public/sitemap.xml');
});

// Agendar a execução da função todos os dias à meia-noite
cron.schedule('0 0 * * *', () => {
  console.log('Atualizando o sitemap...');
  generateSitemap();
});
router.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
});




// // Agendar a execução da função a cada segundo
// cron.schedule('* * * * * *', () => {
//   console.log('Atualizando o sitemap...');
//   generateSitemap();
// });

module.exports = router;