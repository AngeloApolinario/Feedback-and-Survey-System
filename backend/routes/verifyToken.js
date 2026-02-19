const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Look for the token in the 'auth-token' header
  const token = req.header("auth-token");

  // 1. If no token, deny access
  if (!token) return res.status(401).send("Access Denied: No Token Provided");

  try {
    // 2. Try to verify the token using your secret key from .env
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    // 3. Add the user data (ID) to the request object so routes can use it
    req.user = verified;

    // 4. Move on to the actual route logic
    next();
  } catch (err) {
    // 5. If token is expired or fake
    res.status(400).send("Invalid Token");
  }
};
