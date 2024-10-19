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
  const { storeID } = req.params;

  try {
    // Buscar todas as mensagens do storeID
    const messages = await Chat.find({ storeID }).sort({ createdAt: 1 });

    // Agrupar mensagens e suas respostas
    const groupedMessages = messages.reduce((acc, message) => {
      // Verifica se a mensagem tem uma mensagem que está respondendo
      if (message.replyTo) {
        // Encontra a mensagem à qual esta mensagem está respondendo
        const parentMessage = acc.find(msg => msg._id.toString() === message.replyTo.toString());

        if (parentMessage) {
          // Adiciona a mensagem como uma resposta
          if (!parentMessage.replies) {
            parentMessage.replies = [];
          }
          parentMessage.replies.push(message);
        }
      } else {
        // Se não houver resposta, adiciona como mensagem de nível superior
        acc.push({ ...message.toObject(), replies: [] });
      }
      return acc;
    }, []);

    res.json(groupedMessages);
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

router.post('/messages/reply', async (req, res) => {
  const { from, message, storeID, userID, replyTo } = req.body;

  if (!from || !message || !storeID || !userID) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const newMessage = new Chat({
    from,
    message,
    storeID,
    userID,
    replyTo, // deve conter o ID da mensagem original
  });

  try {
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erro ao salvar a mensagem:', error);
    res.status(500).json({ message: 'Erro ao salvar a mensagem' });
  }
});


router.patch('/messages/read/:userID/:storeID', async (req, res) => {
  const { userID, storeID } = req.params;

  try {
    // Atualiza as mensagens como lidas
    await Chat.updateMany({ userID, storeID, read: false }, { read: true });

    // Conta as mensagens não lidas
    const unreadCount = await Chat.countDocuments({ userID, storeID, read: false });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Erro ao atualizar mensagens:', error);
    res.status(500).json({ message: 'Erro ao atualizar mensagens.' });
  }
});


module.exports = router;
