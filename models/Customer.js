const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  customerId:{ type: String,  },
  name: { type: String, },
  cpfCnpj: { type: String,  },
  mobilePhone: { type: String,  },
  email: { type: String },
  postalCode: { type: String,  },
  address: { type: String },
  addressNumber: { type: String, },
  complement: { type: String },
  province: { type: String,  },
  city: { type: String },
  state: { type: String },
  asaasCustomerId: { type: String },
 
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isRegistered: { type: Boolean, default: false }, // Novo campo

  createdAt: {
    type: Date,
    default: Date.now()
  }
});



module.exports = mongoose.model("Customer", customerSchema);