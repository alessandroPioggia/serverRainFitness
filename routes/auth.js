const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrazione
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        const { username, email, password, userType } = req.body;

        // Validazione
        if (!username || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Tutti i campi sono obbligatori',
                received: { username, email, password: '***' }
            });
        }


        // Verifica se l'utente esiste già
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'Utente già esistente' });
        }

        // Hash della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crea il nuovo utente
        user = new User({
            username,
            email,
            password: hashedPassword,
            userType: userType || 'athlete'
        });

        await user.save();
        console.log('User saved:', {
            username: user.username,
            hashedPassword: user.password
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                userType: user.userType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Errore del server durante la registrazione',
            error: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', {
            username: req.body.username,
            passwordReceived: !!req.body.password
        });

        const { username, password } = req.body;

        // Cerca l'utente
        const user = await User.findOne({ username });
        console.log('User found:', user ? 'yes' : 'no');

        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        // Verifica la password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Errore del server durante il login',
            error: error.message
        });
    }
});

// Logout (versione token-based)
router.post('/logout', (req, res) => {
    // Con JWT, il logout è gestito lato client rimuovendo il token
    res.json({ message: 'Logout effettuato con successo' });
});

// Verifica autenticazione
router.get('/verify', (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.json({ isAuthenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        res.json({ isAuthenticated: true, userId: decoded.userId });
    } catch (error) {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;