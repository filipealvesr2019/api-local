const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  attendant: String,
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserForm",
    required: true,
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ecommerce",
    required: true,
  },
  from: String,
  message: String,
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', default: null }, // Campo para vincular respostas
  createdAt: { type: Date, default: Date.now }, // Data de envio
  read: { type: Boolean, default: false } // Campo para verificar se a mensagem foi lida

});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
