const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Ecommerce = require('../models/Ecommerce');
const Theme = require('../models/Theme');
const QRCode = require('qrcode');
const ObjectId = mongoose.Types.ObjectId; // Importando ObjectId

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
  router.get('/eccomerces', async (req, res) => {
    try {
      const ecommerce = await Ecommerce.find();
      res.send(ecommerce);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  router.get('/loja/:subdomain', async (req, res) => {
    const { subdomain } = req.params;
  
    try {
      const ecommerce = await Ecommerce.findOne({ dominio: subdomain }).select('-adminID').exec();
  
      if (!ecommerce) {
        return res.status(404).json({ success: false, error: 'E-commerce não encontrado.' });
      }
  
      res.status(200).json(ecommerce);
    } catch (error) {
      console.error('Erro ao buscar e-commerce', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
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


// Rota para encontrar o QR Code pelo _id da loja
router.get('/pix/ecommerce/:_id/qrcode', async (req, res) => {
  try {
    const { _id } = req.params;

    // Busca o QR Code no banco de dados diretamente pelo _id (tratado como string)
    const ecommerce = await Ecommerce.findOne({ _id: _id });

    if (!ecommerce) {
      return res.status(404).json({ error: `Store with ID ${_id} not found` });
    }

    // Retorna o QR Code encontrado
    res.status(200).json({ qrCodeUrl: ecommerce.qrCodeUrl, pixKey: ecommerce.pixKey });
  } catch (error) {
    console.error('Error retrieving store:', error);
    res.status(500).json({ error: "An error occurred while retrieving the store", details: error.message });
  }
});


// Rota para buscar pixKey e qrCodeUrl pelo adminID
router.get('/pix/admin/:adminID', async (req, res) => {
  try {
    // Busca o documento Ecommerce pelo adminID
    const ecommerce = await Ecommerce.findOne({ adminID: req.params.adminID }).select('pixKey qrCodeUrl');
    
    if (!ecommerce) {
      return res.status(404).json({ message: 'E-commerce não encontrado' });
    }

    // Retorna pixKey e qrCodeUrl
    res.json({
      pixKey: ecommerce.pixKey,
      qrCodeUrl: ecommerce.qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o e-commerce', error });
  }
});

router.put('/update-pixkey/:adminID', async (req, res) => {
  try {
    const { adminID } = req.params;
    const { pixKey } = req.body;

    // Verifica se o adminID e o pixKey são válidos
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ error: "Invalid admin ID" });
    }

    if (!pixKey) {
      return res.status(400).json({ error: "Pix Key is required" });
    }

    // Atualiza o campo pixKey no banco de dados
    const updatedEcommerce = await Ecommerce.findOneAndUpdate(
      { adminID: adminID },
      { pixKey: pixKey },
      { new: true } // Retorna o documento atualizado
    );

    if (!updatedEcommerce) {
      return res.status(404).json({ error: "Ecommerce not found for this admin" });
    }

    // Retorna o documento atualizado
    res.status(200).json({ updatedEcommerce });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Pix Key" });
  }
});



// Rota para cadastrar o QR Code no banco de dados

// Rota para cadastrar o QR Code no banco de dados
router.post('/ecommerce/admin/qrcode', async (req, res) => {
  const { pixKey, adminID } = req.body;

  // Verificação dos dados recebidos
  if (!pixKey || !adminID) {
    return res.status(400).json({ error: "Pix Key and Admin ID are required" });
  }

  // Verifica se o adminID é válido
  if (!ObjectId.isValid(adminID)) {
    return res.status(400).json({ error: "Invalid admin ID" });
  }

  try {
    // Gera o QR Code
    const qrCodeUrl = await QRCode.toDataURL(pixKey);

    // Verifica se já existe um e-commerce com esse adminID
    let ecommerce = await Ecommerce.findOne({ adminID });

    if (ecommerce) {
      // Se já existir, atualiza o QR Code e a chave Pix
      ecommerce.qrCodeUrl = qrCodeUrl;
      ecommerce.pixKey = pixKey;
    } else {
      // Se não existir, cria um novo registro de e-commerce
      ecommerce = new Ecommerce({ adminID, pixKey, qrCodeUrl });
    }

    // Salva no banco de dados
    await ecommerce.save();

    res.status(201).json({ message: "QR Code successfully saved", qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Rota para buscar todos os detalhes da loja pelo adminID
router.get('/loja/admin/:adminID', async (req, res) => {
  try {
    // Busca o documento Ecommerce pelo adminID
    const loja = await Ecommerce.findOne({ adminID: req.params.adminID });
    
    if (!loja) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    // Retorna todos os detalhes da loja
    res.json(loja);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a loja', error });
  }
});

// Rota para obter todas as lojas com o campo dominio
router.get('/lojas', async (req, res) => {
  try {
    const lojas = await Ecommerce.find({}, 'dominio'); // Obtém apenas o campo dominio
    res.status(200).json(lojas); // Retorna as lojas como JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar lojas' });
  }
});
module.exports = router;