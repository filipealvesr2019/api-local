const mongoose = require("mongoose");


const whatsappSchema  = new mongoose.Schema({
    adminID:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
    from: String,
    to: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

// Correctly define the Cart model
const Whatsapp  = mongoose.model("Whatsapp", whatsappSchema );

// Export the Cart model
module.exports = Whatsapp;
