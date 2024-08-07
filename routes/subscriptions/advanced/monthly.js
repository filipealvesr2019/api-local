const express = require('express');
const Customer = require('../../../models/Customer');
const Pix = require('../../../models/Pix/Pix');
const router = express.Router();
const axios = require("axios");
const Boleto = require('../../../models/Boleto/Boleto');
const Credito = require('../../../models/Credito/Credito');

// pagar pix com checkout transparente
router.post("/monthly/subscription/pix/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer associated with the attendant
    const customer = await Customer.findOne({ customerId: customerId });

    if (!customer) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Find the asaasCustomerId of the customer
    const asaasCustomerId = customer.asaasCustomerId;

    const data = {
      billingType: 'PIX',
      discount: { value: 10, dueDateLimitDays: 0 },
      interest: { value: 2 },
      fine: { value: 1 },
      cycle: 'MONTHLY',
      customer: asaasCustomerId,
      nextDueDate: '2024-07-29',
      value: 29.99,
      description: 'Assinatura Plano basico',
    };

    console.log("Sending request with data:", data);
    const token = process.env.ACCESS_TOKEN;

    if (!token) {
      console.error("Access token is missing");
      return res.status(401).json({ error: "Access token is missing" });
    }

    const response = await axios.post('https://sandbox.asaas.com/api/v3/subscriptions',
      data,
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: `${token}`,
          'User-Agent': 'dsadsadsad'
        },
      }
    );

    console.log("Response data:", response.data);

    // Save the subscription information to the Pix model
    const pix = new Pix({
      billingType: "PIX",
      customerId: customerId,
      customer: response.data.customer,
      value: response.data.value,
      invoiceUrl: response.data.invoiceUrl,
      bankSlipUrl: response.data.bankSlipUrl,
      dueDate: response.data.dueDate,
    });

    await pix.save();

    res.json(response.data);
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      } : undefined,
      request: error.request ? error.request : undefined
    });

    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(500).json({ error: "No response received from the server" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});












router.post("/monthly/subscription/boleto/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer associated with the attendant
    const customer = await Customer.findOne({ customerId: customerId });

    if (!customer) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Find the asaasCustomerId of the customer
    const asaasCustomerId = customer.asaasCustomerId;

    const data = {
      billingType: 'BOLETO',
      discount: { value: 10, dueDateLimitDays: 0 },
      interest: { value: 2 },
      fine: { value: 1 },
      cycle: 'MONTHLY',
      customer: asaasCustomerId,
      nextDueDate: '2024-07-29',
      value: 29.99,
      description: 'Assinatura Plano basico',
    };

    console.log("Sending request with data:", data);
    const token = process.env.ACCESS_TOKEN;

    if (!token) {
      console.error("Access token is missing");
      return res.status(401).json({ error: "Access token is missing" });
    }

    const response = await axios.post('https://sandbox.asaas.com/api/v3/subscriptions',
      data,
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: `${token}`,
          'User-Agent': 'dsadsadsad'
        },
      }
    );

    console.log("Response data:", response.data);

    // Save the subscription information to the Pix model
    const pix = new Boleto({
      billingType: "BOLETO",
      customerId: customerId,
      customer: response.data.customer,
      value: response.data.value,
      invoiceUrl: response.data.invoiceUrl,
      bankSlipUrl: response.data.bankSlipUrl,
      dueDate: response.data.dueDate,
    });

    await pix.save();

    res.json(response.data);
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      } : undefined,
      request: error.request ? error.request : undefined
    });

    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(500).json({ error: "No response received from the server" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});




router.post("/monthly/subscription/credito/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer associated with the attendant
    const customer = await Customer.findOne({ customerId: customerId });

    if (!customer) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Find the asaasCustomerId of the customer
    const asaasCustomerId = customer.asaasCustomerId;

    const data = {
      billingType: 'CREDIT_CARD',
      cycle: 'MONTHLY',
      creditCard: {
        holderName: 'john doe',
        number: '5162306219378829',
        expiryMonth: '8',
        expiryYear: '2024',
        ccv: '318'
      },
      creditCardHolderInfo: {
        name: 'John Doe',
        email: 'john.doe@asaas.com.br',
        cpfCnpj: '24971563792',
        postalCode: '89223-005',
        addressNumber: '277',
        addressComplement: null,
        phone: '',
        mobilePhone: '859999999'
      },
      customer: asaasCustomerId,
      nextDueDate: '2024-07-29',
      value: 29.99,
      description: 'Assinatura Plano basico',
    };

    console.log("Sending request with data:", data);
    const token = process.env.ACCESS_TOKEN;

    if (!token) {
      console.error("Access token is missing");
      return res.status(401).json({ error: "Access token is missing" });
    }

    const response = await axios.post('https://sandbox.asaas.com/api/v3/subscriptions',
      data,
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: `${token}`,
          'User-Agent': 'dsadsadsad'
        },
      }
    );

    console.log("Response data:", response.data);

    // Save the subscription information to the Pix model
    const credito = new Credito({
      billingType: "CREDIT_CARD",
      customerId: customerId,
      customer: response.data.customer,
      value: response.data.value,
      invoiceUrl: response.data.invoiceUrl,
      bankSlipUrl: response.data.bankSlipUrl,
      dueDate: response.data.dueDate,
    });

    await credito.save();

    res.json(response.data);
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      } : undefined,
      request: error.request ? error.request : undefined
    });

    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(500).json({ error: "No response received from the server" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
