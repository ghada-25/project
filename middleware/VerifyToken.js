const jwt = require('jsonwebtoken');

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    // Get the token from the request header
    const token = req.header('Authorization');

    // Check if token is present
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key

        // Attach the decoded payload to the request object for further use
        req.user = decoded;

        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

module.exports = { verifyToken };
