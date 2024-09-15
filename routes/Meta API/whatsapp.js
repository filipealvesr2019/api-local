const express = require("express");
const  Message  = require("../../models/meta API/Message");
const { default: axios } = require("axios");

const router = express.Router();

// Rota para receber mensagens do WhatsApp
router.post('/webhook/whatsapp', async (req, res) => {
    const { from, to, message } = req.body;
  
    // Salve a mensagem no MongoDB
    try {
      const newMessage = new Message({ from, to, message });
      await newMessage.save();
      res.status(200).send('Mensagem recebida com sucesso');
    } catch (error) {
      console.error('Erro ao salvar a mensagem:', error);
      res.status(500).send('Erro ao salvar a mensagem');
    }
  });
  
  // Rota para enviar uma mensagem pelo WhatsApp
  router.post('/send-whatsapp', async (req, res) => {
    const { to, message } = req.body;
  
    try {
      const response = await axios.post('https://api.zenvia.com/v2/channels/whatsapp/messages', {
        from: '+5585985757974', // Substitua pelo seu número de telefone no formato internacional
        to,
        contents: [{ type: 'text', text: message }]
      }, {
        headers: {
                       'X-API-TOKEN': `${process.env.ZENVIA_API_KEY}`,
                       },
      });
  
      res.status(200).send(response.data);
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
      res.status(500).send('Erro ao enviar a mensagem');
    }
  });

//   // Rota para enviar uma mensagem pelo WhatsApp
//   router.post('/send-whatsapp', async (req, res) => {
//     const { to, message } = req.body;
  
//     try {
//       const response = await axios.post('https://api.zenvia.com/v2/channels/whatsapp/messages', {
//         from: '+5585985757974',
//         to,
//         contents: [{ type: 'text', text: message }]
//       }, {
     
//         headers: {
//             'X-API-TOKEN': `${process.env.ZENVIA_API_KEY}`,
//           },
//       });
  
//       res.status(200).send(response.data);
//     } catch (error) {
//       console.error('Erro ao enviar a mensagem:', error);
//       res.status(500).send('Erro ao enviar a mensagem');
//     }
//   });
  
  
module.exports = router;