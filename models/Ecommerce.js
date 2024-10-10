const mongoose = require('mongoose');

const EcommerceSchema = new mongoose.Schema({
  adminID: mongoose.Schema.Types.ObjectId,
 
  layout: { type: String }, // 'layout1', 'layout2', etc.

  theme: {
    header: {
      Logo: {type: String, default:"https://i.imgur.com/bMWS6ec.png"},
      backgroundColor: {type: String, default:"#0088CC"},
      color:  { type: String, default: "#ffffff" }, 
      icons:  [{ type: String, default: ['https://i.imgur.com/n05IYkV.png', 'https://i.imgur.com/1XrvJJL.png', "https://i.imgur.com/ItjKDhc.png"]
      }]
    },
    footer: {
      backgroundColor: {type: String, default:"#ffffff"},

      color:  { type: String, default: "#222529" }, 

     
    },
    main: {
      backgroundColor: String,
      color: String,
    },
  },
  dominio: { type: String, default: null },
  porta: { type: Number, default: null },

pixKey: { type: String, },
qrCodeUrl: { type: String, },

bairros: [{
  cidade: String,
  estado: String,
  bairro: String,
}],
 horarioFuncionamento: {
    abertura: { type: String}, // Exemplo: '08:00'
    fechamento: { type: String} // Exemplo: '21:00'
  }
});

module.exports = mongoose.model('Ecommerce', EcommerceSchema);
