const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User'); // Seu modelo de usuário
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy(
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3002/api/google/callback",
        scope: ['profile', 'email'] // Certifique-se de que isso está presente e configurado corretamente

  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ googleId: profile.id });
      if (user) {
        console.log('User found:', user); // Log do usuário encontrado
        return done(null, user);
      }
      
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      
      await newUser.save();
      console.log('New user created:', newUser); // Log do novo usuário criado
      return done(null, newUser);
    } catch (err) {
      console.error('Error during Google authentication:', err); // Log de erro
      return done(err);
    }
  }));
  

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_CLIENT_ID,
//   clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//   callbackURL: "/auth/facebook/callback",
//   profileFields: ['id', 'displayName', 'emails']
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const user = await User.findOne({ facebookId: profile.id });
//     if (user) {
//       return done(null, user);
//     }

//     const newUser = new User({
//       facebookId: profile.id,
//       name: profile.displayName,
//       email: profile.emails[0].value
//     });

//     await newUser.save();
//     return done(null, newUser);
//   } catch (err) {
//     return done(err);
//   }
// }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
