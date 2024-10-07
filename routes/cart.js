const express = require("express");
const Cart = require("../models/cart/cart");
const Product = require("../models/products/product");
const UserForm = require("../models/UserForm");
const { default: mongoose } = require("mongoose");
const FinancialTransaction = require("../models/Financial/FinancialTransaction");

const router = express.Router();
const { ObjectId } = require('mongoose').Types;

router.post("/cart/:userID/:productId", async (req, res) => {
  try {
    const { userID, productId } = req.params;
    const { quantity,variations   } = req.body; // Array de variações

    // Verifique se o customerId e o productId são válidos
    if (!ObjectId.isValid(userID) || !ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid customer ID or product ID" });
    }

    // Buscar cliente no banco de dados
    const User = await UserForm.findOne({ userID: userID });
    if (!User) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Buscar produto no banco de dados
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Verificar se o quantity é um número válido
    if(isNaN(quantity) || quantity <= 0){
      return res.status(400).json({error: 'Invalid quantity'})
    }


    // Criar novo pedido com as variações fornecidas
    const newOrder = new Cart({
      productId: productId, // Adicione productId
      userID: User.userID,
      storeID: User.storeID,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      variations,
      status: 'PENDING', // Campo para o status da compra
      createAt: new Date(), // Preenche com a data e hora atuais
     


    });

    // Salvar pedido no banco de dados
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the order" });
  }
});


// Excluir item do carrinho
router.delete("/cart/:userID/:productId", async (req, res) => {
  const { userID, productId } = req.params;

  try {
    // Verifique se o userID e o productId são válidos
    if (!ObjectId.isValid(userID) || !ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid user ID or product ID" });
    }

    // Buscar o item no carrinho
    const cartItem = await Cart.findOne({ userID, productId });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Remover o item do carrinho
    await Cart.deleteOne({ userID, productId });

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while removing the item from the cart" });
  }
});





// Rota para buscar todas as vendas de um carrinho por storeID
router.get("/user/vendas/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Buscar todas as vendas que correspondem ao storeID
    const vendas = await Cart.find({ storeID });

    // Se não houver vendas, retornar uma mensagem informativa
    if (vendas.length === 0) {
      return res.status(404).json({ message: "Nenhuma venda encontrada para esta loja." });
    }

    // Retornar as vendas encontradas
    res.status(200).json(vendas);
  } catch (error) {
    // Se houver um erro na consulta, retornar o erro
    res.status(500).json({ message: "Erro ao buscar vendas", error });
  }
});





router.get("/vendas/total-ano/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Pega o primeiro e o último dia do ano atual
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1); // Primeiro dia do ano
    const lastDayOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // Último dia do ano

    // Filtra por storeID, status 'RECEIVED' e compras feitas no ano atual
    const vendasDoAno = await Cart.aggregate([
      {
        $match: {
          storeID: new mongoose.Types.ObjectId(storeID),
          status: "RECEIVED", // Certifique-se de que o status é exatamente "RECEIVED"
          purchaseDate: {
            $gte: firstDayOfYear, // Compras a partir do primeiro dia do ano
            $lte: lastDayOfYear, // Compras até o último dia do ano
          },
        },
      },
      {
        $group: {
          _id: null, // Não agrupamos por nenhum campo, apenas somamos
          totalGanho: { $sum: "$totalAmount" }, // Soma os totalAmount, que é o valor total da compra
        },
      },
    ]);

    // Verifica se há vendas no ano
    if (vendasDoAno.length === 0) {
      return res.status(200).json({ totalGanho: 0 });
    }

    // Retorna o total ganho no ano
    res.status(200).json({ totalGanho: vendasDoAno[0].totalGanho });
  } catch (error) {
    console.error("Erro ao calcular o total de vendas do ano:", error);
    res.status(500).json({ message: "Erro ao calcular o total do ano", error });
  }
});




router.get("/produtos-mais-vendidos-dia/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;

    // Pega o início do dia e o fim do dia atual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Define a hora como início do dia

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Define a hora como o final do dia

    // Filtra por storeID e status "RECEIVED" e compras feitas no dia atual
    const produtosMaisVendidosDia = await Cart.aggregate([
      {
        $match: {
          storeID: new mongoose.Types.ObjectId(storeID),
          status: "RECEIVED", // Apenas compras confirmadas
          purchaseDate: {
            $gte: startOfDay, // Compras a partir do início do dia
            $lte: endOfDay, // Compras até o final do dia
          },
        },
      },
      {
        $group: {
          _id: "$name", // Agrupa pelo nome do produto
          totalVendas: { $sum: "$quantity" }, // Soma a quantidade vendida
          totalPrecoVendas: { $sum: "$totalAmount" }, // Soma o valor totalAmount diretamente
          produto: { $first: "$$ROOT" }, // Mantém o primeiro documento completo
        },
      },
      {
        $sort: {
          totalVendas: -1, // Ordena do mais vendido para o menos vendido
        },
      },
    ]);

    if (produtosMaisVendidosDia.length === 0) {
      return res.status(200).json({ message: "Nenhuma venda encontrada." });
    }

    // Retorna os produtos mais vendidos no dia
    res.status(200).json(
      produtosMaisVendidosDia.map((item) => ({
        produto: item.produto.name,
        totalVendas: item.totalVendas,
        totalPrecoVendas: item.totalPrecoVendas, // Preço total de vendas para esse produto
        detalhes: {
          categoria: item.produto.category,
          imagem: item.produto.imageUrl,
          preco: item.produto.price,
        },
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar os produtos mais vendidos do dia:", error);
    res.status(500).json({ message: "Erro ao buscar os produtos mais vendidos do dia", error });
  }
});

router.get("/produtos-mais-vendidos-relatorio/:storeID", async (req, res) => {
  try {
    const { storeID } = req.params;
    const { startDate, endDate } = req.query; // Obtém as datas de início e fim dos parâmetros da URL

    // Converte as strings de data em objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Define a hora final do dia de fim

    // Verifica se as datas são válidas
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Datas inválidas. Use o formato YYYY-MM-DD." });
    }

    // Filtra por storeID e status "RECEIVED" dentro do intervalo de tempo
    const produtosMaisVendidos = await Cart.aggregate([
      {
        $match: {
          storeID: new mongoose.Types.ObjectId(storeID),
          status: "RECEIVED", // Apenas compras confirmadas
          purchaseDate: {
            $gte: start, // Compras a partir da data de início
            $lte: end, // Compras até a data de fim
          },
        },
      },
      {
        $group: {
          _id: "$name", // Agrupa pelo nome do produto
          totalVendas: { $sum: "$quantity" }, // Soma a quantidade vendida
          totalPrecoVendas: { $sum: "$totalAmount" }, // Soma o valor totalAmount diretamente
          produto: { $first: "$$ROOT" }, // Mantém o primeiro documento completo
        },
      },
      {
        $sort: {
          totalVendas: -1, // Ordena do mais vendido para o menos vendido
        },
      },
    ]);

    if (produtosMaisVendidos.length === 0) {
      return res.status(200).json({ message: "Nenhuma venda encontrada no período selecionado." });
    }

    // Retorna os produtos mais vendidos
    res.status(200).json(
      produtosMaisVendidos.map((item) => ({
        produto: item.produto.name,
        totalVendas: item.totalVendas,
        totalPrecoVendas: item.totalPrecoVendas, // Preço total de vendas para esse produto
        detalhes: {
          categoria: item.produto.category,
          imagem: item.produto.imageUrl,
          preco: item.produto.price,
        },
      }))
    );
  } catch (error) {
    console.error("Erro ao gerar o relatório de produtos mais vendidos:", error);
    res.status(500).json({ message: "Erro ao gerar o relatório", error });
  }
});












// // Rota para atualizar o status da compra para "RECEIVED" ou "PENDING"
// router.put("/compras/:cartId/status", async (req, res) => {
//   const { cartId } = req.params; // ID da compra passada como parâmetro na URL
//   const { status } = req.body; // Status enviado no corpo da requisição

//   // Verifica se o status enviado é válido
//   const validStatuses = ["RECEIVED", "PENDING"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ message: "Status inválido. Use 'RECEIVED' ou 'PENDING'." });
//   }

//   try {
//     // Encontrar e atualizar o status da compra com o novo valor
//     const updatedCart = await Cart.findByIdAndUpdate(
//       cartId,
//       { status }, // Atualiza o campo status com o valor enviado
//       { new: true } // Retorna o documento atualizado
//     );

//     // Se a compra não for encontrada, retorne um erro
//     if (!updatedCart) {
//       return res.status(404).json({ message: "Compra não encontrada" });
//     }

//     // Retorna o carrinho atualizado como resposta
//     res.status(200).json({ message: `Status atualizado para '${status}'`, updatedCart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erro ao atualizar status da compra", error });
//   }
// });

// Rota para atualizar o status da compra para "RECEIVED" ou "PENDING"
router.put("/compras/:cartId/status", async (req, res) => {
  const { cartId } = req.params; // ID da compra passada como parâmetro na URL
  const { status, adminID  } = req.body; // Status enviado no corpo da requisição

    // Verifica se o adminID é válido
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: "ID de administrador inválido." });
    }

  // Verifica se o status enviado é válido
  const validStatuses = ["RECEIVED", "PENDING"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Status inválido. Use 'RECEIVED' ou 'PENDING'." });
  }

  try {
    // Buscar a compra (carrinho) existente
    const cart = await Cart.findById(cartId);

    // Se a compra não for encontrada, retorne um erro
    if (!cart) {
      return res.status(404).json({ message: "Compra não encontrada" });
    }

    // Se o status anterior era "RECEIVED" e o novo status não for "RECEIVED", apagar a receita associada
    if (cart.status === "RECEIVED" && status !== "RECEIVED") {
      await FinancialTransaction.findOneAndDelete({ relatedCart: cart._id, type: "receita" });
    }

    // Atualizar o status da compra
    cart.status = status;
    await cart.save();

    // Se o novo status for "RECEIVED", criar uma nova entrada de receita
    if (status === "RECEIVED") {
      const newTransaction = new FinancialTransaction({
        adminID,
        type: "receita",
        description: `Receita de venda: ${cart.name}`,
        amount: cart.totalAmount,
        status: "RECEIVED",
        relatedCart: cart._id,
        createdAt: new Date(),
        categoryName: cart.category
      });

      await newTransaction.save();
    }

    // Retorna o carrinho atualizado como resposta
    res.status(200).json({ message: `Status atualizado para '${status}'`, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar status da compra", error });
  }
});






// Rota para obter todos os produtos no carrinho por userID
router.get("/cartProducts/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    const cartItems = await Cart.find({ userID })
      .populate("variations")
      .populate("storeID") // Para popular os dados da loja, se necessário
      .exec();

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Carrinho vazio." });
    }

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Erro ao buscar itens no carrinho." });
  }
});

// Rota para obter o total de pedidos do carrinho por userID
router.get("/totalOrders/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    // Busca os itens do carrinho pelo userID
    const cartItems = await Cart.find({ userID });

    // Calcula o total considerando o preço do produto, quantidade e variações
    const totalOrders = cartItems.reduce((acc, item) => {
      // Preço total inicial (apenas o preço base multiplicado pela quantidade)
      let itemTotal = item.price * item.quantity;
    
      // Se houver variações, somamos o total das variações ao preço base (uma vez)
      if (item.variations && item.variations.length > 0) {
        const variationsTotal = item.variations.reduce((variationAcc, variation) => variationAcc + variation.price, 0);
        
        // Adicionar o preço total das variações uma única vez, não multiplicado pela quantidade
        itemTotal += variationsTotal;
      }
    
      // Adicionar ao total acumulado
      return acc + itemTotal;
    }, 0);
    

    res.json({ totalOrders });
  } catch (error) {
    console.error("Error fetching total orders:", error);
    res.status(500).json({ message: "Erro ao buscar total de pedidos." });
  }
});









module.exports = router;