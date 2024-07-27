const mongoose = require('mongoose');

const EcommerceSchema = new mongoose.Schema({
  clienteId: mongoose.Schema.Types.ObjectId,
  theme: {
    header: {
      backgroundColor: String,
      color: String,
    },
    footer: {
      backgroundColor: String,
      color: String,
    },
    main: {
      backgroundColor: String,
      color: String,
    },
  },
  dominio: { type: String, default: null },
  porta: { type: Number, default: null },
});

module.exports = mongoose.model('Ecommerce', EcommerceSchema);
