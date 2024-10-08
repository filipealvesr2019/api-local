const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const QRCode = require('qrcode');
const PixQRCode = require('../../models/Pix/QRCodePIX');
const Ecommerce = require('../../models/Ecommerce');
const ObjectId = mongoose.Types.ObjectId; // Importando ObjectId


// Rota para cadastrar o QR Code no banco de dados
router.post('/admin/qrcode', async (req, res) => {
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
    let pix = await PixQRCode.findOne({ adminID });

 
      // Se não existir, cria um novo registro de e-commerce
      pix = new PixQRCode({ adminID, pixKey, qrCodeUrl });
 

    // Salva no banco de dados
    await pix.save();

    res.status(201).json({ message: "QR Code successfully saved", qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Rota para buscar pixKey e qrCodeUrl pelo adminID
router.get('/admin/:adminID', async (req, res) => {
    try {
      // Busca o documento Ecommerce pelo adminID
      const pix = await PixQRCode.findOne({ adminID: req.params.adminID }).select('pixKey qrCodeUrl');
      
      if (!pix) {
        return res.status(404).json({ message: 'E-commerce não encontrado' });
      }
  
      // Retorna pixKey e qrCodeUrl
      res.json({
        pixKey: pix.pixKey,
        qrCodeUrl: pix.qrCodeUrl,
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar o e-commerce', error });
    }
  });

// Rota para buscar PixKeys e qrCodeUrls por adminID
router.get("/admin/pix-keys/:adminID", async (req, res) => {
    try {
        const { adminID } = req.params;
        
        // Buscar todos os documentos com o adminID
        const pixData = await PixQRCode.find({ adminID });

        if (!pixData || pixData.length === 0) {
            return res.status(404).json({ message: "Nenhum dado encontrado para este adminID." });
        }

        res.status(200).json(pixData);
    } catch (error) {
        console.error("Erro ao buscar PixKeys:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});


// Rota para excluir um QR Code específico pelo ID
router.delete('/admin/pix-keys/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtém o ID da URL
    const deletedQRCode = await PixQRCode.findByIdAndDelete(id); // Encontra e exclui o QR Code pelo ID

    if (!deletedQRCode) {
      return res.status(404).json({ message: 'QR Code não encontrado' });
    }

    res.status(200).json({ message: 'QR Code excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir QR Code:', error);
    res.status(500).json({ message: 'Erro ao excluir QR Code', error });
  }
});

// Rota para atualizar o pixKey e qrCodeUrl no Ecommerce
router.put("/ecommerce/update-pix/:adminID", async (req, res) => {
    const { adminID } = req.params;
    const { pixKey, qrCodeUrl } = req.body;
  
    try {
      // Encontra o ecommerce pelo adminID e atualiza o pixKey e qrCodeUrl
      const updatedEcommerce = await Ecommerce.findOneAndUpdate(
        { adminID },
        { pixKey, qrCodeUrl },
        { new: true }
      );
  
      if (!updatedEcommerce) {
        return res.status(404).json({ message: "Ecommerce não encontrado." });
      }
  
      res.status(200).json(updatedEcommerce);
    } catch (error) {
      console.error("Erro ao atualizar Ecommerce:", error);
      res.status(500).json({ message: "Erro no servidor." });
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
  
module.exports = router;