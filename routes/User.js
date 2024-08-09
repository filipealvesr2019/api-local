const router = require('express').Router();
const passport = require('passport');

// Autenticação Local
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: req.user });
});

// Rota para iniciar a autenticação com Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Certifique-se de que isso está presente e configurado corretamente
  }));
  
  // Rota de callback para receber o token do Google
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.send('/profile'); // Redirecione para a página desejada
    }
  );
  

  router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Welcome to your profile page!');
  } else {
    res.redirect('/login'); // Redirecionar para a página de login se não estiver autenticado
  }
});


// Autenticação Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect('/dashboard'); // Redirecionar para o dashboard ou para onde preferir
});




module.exports = router;
