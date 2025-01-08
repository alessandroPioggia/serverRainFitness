const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Gestisci le richieste OPTIONS per CORS
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'Token mancante, autorizzazione negata' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token non valido' });
    }
};