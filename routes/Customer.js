const express = require("express");
const router = express.Router();
const postmark = require("postmark");
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const postmarkKey = process.env.POSTMARK_API_KEY;
const client = new postmark.ServerClient(postmarkKey);

const Customer = require("../models/Customer"); // Importe o modelo do Customer


router.post("/signup", async (req, res) => {
  try {
    const {
      customerId,
      name,
      cpfCnpj,
      mobilePhone,
      email,
      postalCode,
      address,
      addressNumber,
      complement,
      province,
      city,
      state,
      asaasCustomerId,
    } = req.body;

    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email já cadastrado. Faça login ou utilize outro email.",
      });
    }

    const newUser = new Customer({
      customerId,
      name,
      cpfCnpj,
      mobilePhone,
      email,
      postalCode,
      address,
      addressNumber,
      complement,
      province,
      city,
      state,
      asaasCustomerId,
      isRegistered: true, // Definir como true quando o usuário for criado
    });

    const savedUser = await newUser.save();

    const token = process.env.ACCESS_TOKEN;
    const url = "https://sandbox.asaas.com/api/v3/customers";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: token,
      },
      body: JSON.stringify({
        name,
        cpfCnpj,
        mobilePhone,
        email,
        postalCode,
        address,
        addressNumber,
        complement,
        province,
        city,
        state,
      }),
    };

    const response = await fetch(url, options);
    const responseData = await response.json();

    // Salva o ID do cliente retornado pelo Asaas no novo campo
    savedUser.asaasCustomerId = responseData.id;
    await savedUser.save();

    res.status(201).json({
      user: savedUser,
      message: "Usuário criado com sucesso.",
      responseData,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao criar usuário." });
  }
});






// Rota para visualizar um cliente específico pelo ID
router.get("/customer/:customerId", async (req, res) => {
  

  try {
    const existingUser = await Customer.findOne({
      customerId: req.params.customerId,
    });

    res.status(200).json(existingUser);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar cliente." });
  }
});

module.exports = router;
