const express = require('express');
const router = express.Router();
const CookiePreference = require('../models/CookiePreference');

// GET route
router.get('/', async (req, res) => {
    console.log('GET /api/cookie-preferences received');
    try {
        // Risposta default per utenti non autenticati
        res.json({ essential: true, analytics: false, marketing: false });
    } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ message: 'Error retrieving preferences' });
    }
});

// POST route
router.post('/', async (req, res) => {
    console.log('POST /api/cookie-preferences received', req.body);
    try {
        res.json({
            ...req.body,
            saved: true
        });
    } catch (error) {
        console.error('POST Error:', error);
        res.status(500).json({ message: 'Error saving preferences' });
    }
});

module.exports = router;