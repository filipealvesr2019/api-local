const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configurando o Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // Permitir todas as origens para CORS
    methods: ["GET", "POST"]
  }
});

// Ouvir por conexões de clientes
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Manipular desconexões
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// Exportando o objeto io para uso em outros arquivos
module.exports = io;
