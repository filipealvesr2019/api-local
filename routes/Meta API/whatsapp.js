const express = require("express");

const { default: axios } = require("axios");
const router = express.Router();




router.post('/send-message', async (req, res) => {
  const { phoneNumber, message } = req.body;

  try {
    // Enviando a mensagem pela API da Meta
    const response = await axios.post(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      text: { body: message },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`, // Use o token da sua API Meta
        'Content-Type': 'application/json',
      }
      
    });

  console.log(message)

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});
module.exports = router;