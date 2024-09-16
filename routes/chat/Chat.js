const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Chat = require("../../models/chat/chat");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const router = express.Router();






// Escutar eventos de conexão Socket.IO
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);
  
    // Evento para enviar mensagem
    socket.on('sendMessage', async (data) => {
      const { from, to, message } = data;
  
      // Salvar mensagem no banco de dados
      const newMessage = new Chat({ from, to, message });
      await newMessage.save();
  
      // Emitir a mensagem para o destinatário
      io.emit('receiveMessage', data);
    });
  
    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log('Usuário desconectado:', socket.id);
    });
  });






module.exports = router;
