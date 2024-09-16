const mongoose = require("mongoose");


const facebookSchema  = new mongoose.Schema({
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
const Facebook  = mongoose.model("Facebook", facebookSchema );

// Export the Cart model
module.exports = Facebook;
