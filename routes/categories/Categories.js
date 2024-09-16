const express = require("express");
const Category = require("../../models/categories/Categories");
const router = express.Router();

// Criar uma nova categoria
router.post("/categories", async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Verifica se a categoria já existe
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Categoria já existe." });
    }

    const category = new Category({ name, type });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar todas as categorias
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
