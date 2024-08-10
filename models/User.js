const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isEmail } = require("validator");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    validate: {
      validator: function (value) {
        // Verifica se a senha contém pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial
        return /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!'{:@#$%^&+,.=)_£}*])/.test(
          value
        );
      },
      message:
        "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
    },
  },
  googleId: { type: String },
  facebookId: { type: String },
  name: { type: String },

  role: {
    type: String,
    required: [true, "Digite uma credencial válida!"],
    validate: {
      validator: validateRole,
      message: "Digite uma credencial válida!",
    },
  },
  confirmed: {
    type: Boolean,
    default: false,
  },

  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Number,
  },
});

function validateRole(value) {
  const allowedRoles = ["user"];
  return allowedRoles.includes(value);
}

UserSchema.methods.comparePassword = async function (gotPassword) {
  return await bcrypt.compare(gotPassword, this.password);
};

// criptografando a senha antes de salva o email e senha do usuario
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION,
  });
};

module.exports = mongoose.model("User", UserSchema);
