const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secret = process.env.SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    let decodedData;

    if (token) {    
      decodedData = jwt.verify(token, secret, (decodedData, error) => {
        if (error) {
          return res.status(401).json({ message: "Invalid Token" });
        }
        req.userId = decodedData?.id;
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({ message: "Error in Token" });
  }
};

module.exports = auth;