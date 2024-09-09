const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Ecommerce = require('../models/Ecommerce');
const Theme = require('../models/Theme');


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
  const { adminID, layout, theme, } = req.body;

  const ecommerce = new Ecommerce({
    adminID,
    theme,
    layout
  });

  await ecommerce.save();

  res.send(ecommerce);
});

// Rota para adicionar domínio a um e-commerce
router.post('/add-domain', async (req, res) => {
  const { clienteId, ecommerceId, dominio } = req.body;
  const porta = currentPort++;

  try {
    const ecommerce = await Ecommerce.findOne({ _id: ecommerceId, adminID });

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
// Nova rota para buscar um e-commerce pelo domínio
router.get('/ecommerce/:dominio', async (req, res) => {
    const { dominio } = req.params;
  
    try {
      const ecommerce = await Ecommerce.findOne({ dominio });
  
      if (!ecommerce) {
        return res.status(404).send('E-commerce não encontrado');
      }
  
      res.send(ecommerce);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


// Rota para listar todos os e-commerces
router.get('/ecommerces', async (req, res) => {
    try {
      const ecommerces = await Ecommerce.find();
      res.send(ecommerces);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });









  // Rota para listar todos os temas
router.get('/themes', async (req, res) => {
    try {
      const themes = await Theme.find();
      res.send(themes);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Rota para adicionar tema a um e-commerce
  router.post('/ecommerce/:ecommerceId/add-theme', async (req, res) => {
    const { ecommerceId } = req.params;
    const { themeId } = req.body;
  
    try {
      const ecommerce = await Ecommerce.findById(ecommerceId);
      const theme = await Theme.findById(themeId);
  
      if (!ecommerce || !theme) {
        return res.status(404).send('E-commerce ou Tema não encontrado');
      }
  
      ecommerce.theme = theme.theme;
      await ecommerce.save();
  
      res.send(ecommerce);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  

// Rota para adicionar um novo tema ao banco de dados
router.post('/add-theme', async (req, res) => {
    const { name, category, theme, layout } = req.body;
  
    const newTheme = new Theme({
      name,
      category,
      layout,
      theme,
    });
  
    try {
      await newTheme.save();
      res.send(newTheme);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


// Rota para buscar um tema específico pelo ID
router.get('/theme/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const theme = await Theme.findById(id);

    if (!theme) {
      return res.status(404).send('Tema não encontrado');
    }

    res.send(theme);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



  // Rota para buscar um e-commerce pelo ID do usuário
router.get('/ecommerce/admin/:adminID', async (req, res) => {
  const { adminID } = req.params;

  try {
    const ecommerce = await Ecommerce.findOne({ adminID });

    if (!ecommerce) {
      return res.status(404).send('E-commerce não encontrado');
    }

    res.send(ecommerce);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
  // Rota para atualizar o tema de um e-commerce
// router.post('/ecommerce/:ecommerceId/update-theme', async (req, res) => {
//   const { ecommerceId } = req.params;
//   const { theme } = req.body;

//   try {
//     const ecommerce = await Ecommerce.findById(ecommerceId);

//     if (!ecommerce) {
//       return res.status(404).send('E-commerce não encontrado');
//     }

//     ecommerce.theme = theme;
//     await ecommerce.save();

//     res.send(ecommerce);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });



// Rota para atualizar o tema de um e-commerce
// Rota para atualizar o tema de um e-commerce
// Rota para atualizar o tema de um e-commerce usando clienteId
// Rota para atualizar o tema de um e-commerce usando _id
router.put('/ecommerce/:id/update-theme', async (req, res) => {
  const { id } = req.params;
  const { theme } = req.body;

  console.log("ID recebido:", id);
  console.log("Tema recebido:", theme);

  try {
    const ecommerce = await Ecommerce.findById(id);

    if (!ecommerce) {
      console.error("E-commerce não encontrado com o ID:", id);
      return res.status(404).send('E-commerce não encontrado');
    }

    ecommerce.theme = theme;
    console.log("Tema antes de salvar:", ecommerce.theme);
    await ecommerce.save();
    console.log("Tema após salvar:", ecommerce.theme);

    res.send(ecommerce);
  } catch (error) {
    console.error("Erro ao atualizar o tema:", error.message);
    res.status(500).send(error.message);
  }
});


module.exports = router;