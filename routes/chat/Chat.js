const express = require("express");
const Chat = require('../../models/chat/chat')


const router = express.Router();


// Rota para salvar uma nova mensagem
router.post('/messages', async (req, res) => {
  const { from, message, storeID, userID } = req.body;

  if (!from || !message || !storeID || !userID) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const newMessage = new Chat({ from, message, storeID, userID });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Erro ao salvar a mensagem:', error);
    res.status(500).json({ message: 'Erro ao salvar a mensagem.' });
  }
});

  
router.get('/messages/:storeID', async (req, res) => {
  const { storeID } = req.params; // Obter o storeID dos parâmetros da URL
  
  try {
    const messages = await Chat.find({ storeID }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar mensagens por userID e storeID
router.get('/messages/:storeID/user/:userID', async (req, res) => {
  const { storeID, userID } = req.params;

  try {
    const messages = await Chat.find({ storeID, userID }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
