const express = require("express");
const Category = require("../../models/categories/Categories");
const router = express.Router();

// Criar uma nova categoria
// Rota para criar uma nova categoria
router.post("/categories", async (req, res) => {
  try {
    const { adminID, name, type } = req.body;

    // Verifica se a categoria já existe para este adminID
    const existingCategory = await Category.findOne({ name, adminID });
    if (existingCategory) {
      return res.status(400).json({ message: "Categoria já existe." });
    }

    // Cria uma nova categoria associada ao adminID
    const category = new Category({ adminID, name, type });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Rota para listar categorias por adminID
router.get("/categories/:adminID", async (req, res) => {
  const { adminID } = req.params;

  try {
    // Busca categorias pelo adminID
    const categories = await Category.find({ adminID });

    // Verifica se há categorias
    if (!categories.length) {
      return res.status(404).json({ message: "Nenhuma categoria encontrada para este adminID" });
    }

    // Retorna as categorias encontradas
    res.status(200).json(categories);
  } catch (error) {
    // Lida com erros e responde com status 500
    res.status(500).json({ message: "Erro ao buscar categorias", error });
  }
});



// Rota para deletar uma despesa
router.delete('/categorias/:adminID/:id', async (req, res) => {
  const { adminID, id } = req.params;

  try {
    const categoria = await Category.findOneAndDelete({
      _id: id,
      adminID: adminID,
    });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    return res.status(200).json({ message: 'Categoria deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar Categoria:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


module.exports = router;
