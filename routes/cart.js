const express = require("express");
const Cart = require("../models/cart/cart");
const product = require("../models/products/product");
const Customer = require("../models/Customer");
const router = express.Router();

router.post("/cart/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findById({
      customerId: req.params.customerId,
    });
    const { name, category, price, imageUrl, variations } = req.body;
    const product = await product;
    const newOrder = new Cart({
      customerId: customer,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      variations: product.variations, // A variação deve seguir o formato definido no schema
    });

    newOrder.save();
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
