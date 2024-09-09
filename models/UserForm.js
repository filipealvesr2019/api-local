const mongoose = require("mongoose");

const userFormSchema = new mongoose.Schema({
  userID:{ type: String,  },
  adminID: { type: String,  },
  name: { type: String, },

  mobilePhone: { type: String,  },
  email: { type: String },
  postalCode: { type: String,  },
  address: { type: String },
  addressNumber: { type: String, },
  complement: { type: String },
  province: { type: String,  },
  city: { type: String },
  state: { type: String },

 
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



module.exports = mongoose.model("UserForm", userFormSchema);