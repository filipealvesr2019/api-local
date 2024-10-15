const mongoose = require('mongoose');

const AdminAlarmSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Referência ao admin que escolheu o alarme
    required: true,
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecommerce', // Referência ao admin que escolheu o alarme
    required: true,
  },
  
  alarmSound: {
    type: String, // URL ou nome do arquivo do som do alarme
    required: true,
  },
  isAlarmActive: {
    type: Boolean, // Valor booleano para ativar ou desativar o alarme
    default: false, // Por padrão, o alarme estará ativado
  },
});

const AdminAlarm = mongoose.model('AdminAlarm', AdminAlarmSchema);

module.exports = AdminAlarm;
