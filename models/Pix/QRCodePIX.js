const mongoose = require("mongoose");

const PixQRCodeSchema = new mongoose.Schema({
    adminID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
    pixKey: { type: String, required: true },
    qrCodeUrl: { type: String, required: true },

});



const PixQRCode = mongoose.model("PixQRCode", PixQRCodeSchema);

module.exports = PixQRCode;