const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
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
});

module.exports = mongoose.model('Theme', ThemeSchema);
