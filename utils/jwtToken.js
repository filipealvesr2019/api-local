const sendToken = (user, statusCode, res) => {
    // Criar JWT token
    const token = user.getJwtToken();
  
    // Opções para os cookies
    const options = {
      expires: new Date(Date.now() + process.env.COOKIE_DURATION * 24 * 60 * 60 * 1000),
      httpOnly: true,
      // Se estiver usando HTTPS, adicione Secure: true
      secure: process.env.NODE_ENV === 'production', 
      // Defina SameSite conforme necessário (None, Lax, Strict)
      sameSite: 'None', // Altere conforme necessário
    };
  
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user,
      });
  };
  
  module.exports = sendToken;
  