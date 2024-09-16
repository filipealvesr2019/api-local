const mongoose = require("mongoose");


const instagramSchema  = new mongoose.Schema({
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
const Instagram  = mongoose.model("Instagram", instagramSchema );

// Export the Cart model
module.exports = Instagram;
