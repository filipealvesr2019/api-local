const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
    url: String,
    price: Number,
    name: String,
});

const cartSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    name: { 
        type: String, 
        required: true,
    },
    category: { 
        type: String, 
        required: true,
    },
    imageUrl: { 
        type: String, 
        required: true,
    },
    price: { 
        type: Number, 
        required: true,
    },
    variations: [variationSchema], // Array de variações
});

// Correctly define the Cart model
const Cart = mongoose.model("Cart", cartSchema);

// Export the Cart model
module.exports = Cart;
