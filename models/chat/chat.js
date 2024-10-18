const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
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
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
