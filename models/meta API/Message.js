const mongoose = require("mongoose");


const messageSchema  = new mongoose.Schema({
    from: String,
    to: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

// Correctly define the Cart model
const Message  = mongoose.model("Message", messageSchema );

// Export the Cart model
module.exports = Message;
