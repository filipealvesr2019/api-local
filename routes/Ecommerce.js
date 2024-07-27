const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Ecommerce = require('../models/Ecommerce');


let currentPort = 3001;

// Função para garantir que os diretórios existam
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Rota para criar um e-commerce
router.post('/create-ecommerce', async (req, res) => {
  const { clienteId, theme } = req.body;

  const ecommerce = new Ecommerce({
    clienteId,
    theme,
  });

  await ecommerce.save();

  res.send(ecommerce);
});

// Rota para adicionar domínio a um e-commerce
router.post('/add-domain', async (req, res) => {
  const { clienteId, ecommerceId, dominio } = req.body;
  const porta = currentPort++;

  try {
    const ecommerce = await Ecommerce.findOne({ _id: ecommerceId, clienteId });

    if (!ecommerce) {
      return res.status(404).send('E-commerce não encontrado');
    }

    ecommerce.dominio = dominio;
    ecommerce.porta = porta;
    await ecommerce.save();

    const config = `
    server {
        listen 80;
        server_name ${dominio};

        location / {
            proxy_pass http://localhost:${porta};
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }`;

    const sitesAvailablePath = path.join(__dirname, 'nginx_sites/sites-available', dominio);
    const sitesEnabledPath = path.join(__dirname, 'nginx_sites/sites-enabled', dominio);

    // Garantir que os diretórios existam
    ensureDirectoryExistence(sitesAvailablePath);
    ensureDirectoryExistence(sitesEnabledPath);

    fs.writeFileSync(sitesAvailablePath, config);
    fs.symlinkSync(sitesAvailablePath, sitesEnabledPath, 'junction'); // Utilize 'junction' no Windows

    res.send(`Domínio ${dominio} registrado na porta ${porta}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;