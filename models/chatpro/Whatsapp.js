




  const mongoose = require("mongoose");

const WhatsappSchema = new mongoose.Schema({
    from: String,
    number: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});



const Whatsapp = mongoose.model("Whatsapp", WhatsappSchema);

module.exports = Whatsapp;