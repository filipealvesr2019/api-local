const express = require("express");
const Message = require("../../models/zenvia/Message");
const { default: axios } = require("axios");
const Instagram = require("../../models/zenvia/Instagram");

const router = express.Router();

// Rota para receber mensagens do WhatsApp
router.post("/webhook/Instagram", async (req, res) => {
  const { from, to, message } = req.body;

  // Salve a mensagem no MongoDB
  try {
    const newMessage = new Message({ from, to, message });
    await newMessage.save();
    res.status(200).send("Mensagem recebida com sucesso");
  } catch (error) {
    console.error("Erro ao salvar a mensagem:", error);
    res.status(500).send("Erro ao salvar a mensagem");
  }
});

// Rota para enviar uma mensagem pelo WhatsApp
// Rota para enviar uma mensagem pelo WhatsApp
router.post("/send-Instagram", async (req, res) => {
  // Extraindo adminID, to, e message do corpo da requisição
  const { to, message, adminID } = req.body;

  try {
    // Enviar a mensagem via API da Zenvia
    const response = await axios.post(
      "https://api.zenvia.com/v2/channels/instagram/messages",
      {
        from: process.env.PHONE_NUMBER, // Substitua pelo seu número de telefone no formato internacional
        to,
        contents: [{ type: "text", text: message }],
      },
      {
        headers: {
          "X-API-TOKEN": `${process.env.ZENVIA_API_KEY}`,
        },
      }
    );

    // Criar um novo documento no MongoDB com os detalhes da mensagem
    const newMessage = new Instagram({
      adminID,   // O ID do admin enviado no body
      from: process.env.PHONE_NUMBER, // O número do remetente
      to,        // O número do destinatário
      message,   // O conteúdo da mensagem
      timestamp: Date.now()  // O horário atual
    });

    // Salvar a mensagem no MongoDB
    await newMessage.save();

    // Responder com os dados da resposta da API Zenvia
    res.status(200).send({ message: 'Mensagem enviada e salva com sucesso', data: response.data });
  } catch (error) {
    console.error("Erro ao enviar a mensagem:", error);
    res.status(500).send("Erro ao enviar a mensagem");
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



// Rota para obter todas as mensagens de um admin específico
router.get('/admin/Instagram/messages/:adminID', async (req, res) => {
  const { adminID } = req.params;

  try {
    // Consultar mensagens no MongoDB com base no adminID
    const messages = await Instagram.find({ adminID });

    if (messages.length === 0) {
      return res.status(404).send('Nenhuma mensagem encontrada para esse adminID');
    }

    // Enviar as mensagens encontradas como resposta
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).send('Erro ao buscar mensagens');
  }
});

module.exports = router;
