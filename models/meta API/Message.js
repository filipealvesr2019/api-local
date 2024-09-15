const mongoose = require("mongoose");


const messageSchema  = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: Date,
    status: String
});

// Correctly define the Cart model
const Message  = mongoose.model("Message", messageSchema );

// Export the Cart model
module.exports = Message;
