const jwt = require('jsonwebtoken');



const secret = process.env.JWT_SECRET;
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];


    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    jwt.verify(token, secret, (error, decodedData) => {
      if (error) {
        return res.status(401).json({ message: "Invalid Token" });
      }
      req.userId = decodedData?.id;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = auth;
