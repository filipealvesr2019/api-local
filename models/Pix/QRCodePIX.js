const mongoose = require("mongoose");

const PixQRCodeSchema = new mongoose.Schema({
    pixKey: { type: String, required: true },
    qrCodeUrl: { type: String, required: true },

});



const PixQRCode = mongoose.model("PixQRCode", PixQRCodeSchema);

module.exports = PixQRCode;