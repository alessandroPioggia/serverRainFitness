const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

router.get('/', async (req, res) => {
    console.log('Backend: Ricevuta richiesta GET /api/exercises');
    try {
        const exercises = await Exercise.find();
        console.log('Backend: Numero di esercizi trovati:', exercises.length);
        console.log('Backend: Primo esercizio come esempio:', exercises[0]);

        res.json(exercises);
    } catch (error) {
        console.error('Backend: Errore nel recupero degli esercizi:', error);
        res.status(500).json({
            message: 'Errore nel recupero degli esercizi',
            error: error.message
        });
    }
});

module.exports = router;