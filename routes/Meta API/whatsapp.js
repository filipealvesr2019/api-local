const express = require("express");
const  Message  = require("../../models/meta API/Message");

const router = express.Router();


// Rota para receber mensagens do WhatsApp via Webhook
router.post('/whatsapp/webhook', async (req, res) => {
    const body = req.body;
  
    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(async (entry) => {
        const changes = entry.changes;
        changes.forEach(async (change) => {
          const value = change.value;
          const messages = value.messages;
  
          if (messages) {
            // Para cada mensagem recebida
            messages.forEach(async (message) => {
              const senderPhoneNumber = message.from;
              const messageContent = message.text.body;
              const timestamp = new Date(message.timestamp * 1000); // Conversão de timestamp
  
              // Salvando a mensagem no MongoDB
              const newMessage = new Message({
                sender: senderPhoneNumber,
                message: messageContent,
                timestamp: timestamp,
                status: 'received'  // Define status como recebido
              });
  
              try {
                await newMessage.save();
                console.log('Mensagem salva no MongoDB');
              } catch (error) {
                console.error('Erro ao salvar mensagem no MongoDB:', error);
              }
            });
          }
  
          // Caso o webhook envie status de mensagem
          const statuses = value.statuses;
          if (statuses) {
            statuses.forEach(async (status) => {
              // Atualiza o status da mensagem no MongoDB
              const messageId = status.id;
              const messageStatus = status.status;
  
              try {
                await Message.findOneAndUpdate(
                  { messageId: messageId },
                  { status: messageStatus }
                );
                console.log('Status da mensagem atualizado:', messageStatus);
              } catch (error) {
                console.error('Erro ao atualizar status da mensagem:', error);
              }
            });
          }
        });
      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  });
module.exports = router;