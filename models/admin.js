const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");

const adminSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Refere-se ao modelo Admin, conectando com o administrador
  },
  name: { type: String, required: true },
  cpfCnpj: { type: String },
  email: {
    type: String,
    required: [true, "Digite um email válido!"],
    lowercase: true,
    unique: true,
    validate: [isEmail, "Digite um email válido"],
  },
  password: {
    type: String,
    required: [true, "Digite uma senha"],
    minLength: [10, "Digite uma senha de no mínimo 10 caracteres"],
    select: false,
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
  components: [
    {
      name: String,
      enabled: Boolean,
    },
  ],
});
function validateRole(value) {
  const allowedRoles = ["administrador", "atendente"];
  return allowedRoles.includes(value);
}
adminSchema.methods.comparePassword = async function (gotPassword) {
  return await bcrypt.compare(gotPassword, this.password);
};

// criptografando a senha antes de salva o email e senha do usuario
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
adminSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION,
  });
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
