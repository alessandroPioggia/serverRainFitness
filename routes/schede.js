const express = require('express');
const router = express.Router();
const Scheda = require('../models/Scheda');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Crea una nuova scheda
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        console.log('User type:', user.userType);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        console.log('Creating scheda with data:', {
            ...req.body,
            isPublic: user.userType === 'trainer',
            publishStatus: user.userType === 'trainer' ? 'published' : 'draft'
        });

        const scheda = new Scheda({
            ...req.body,
            creator: req.userId,
            creatorType: user.userType,
            isPublic: user.userType === 'trainer',
            publishStatus: user.userType === 'trainer' ? 'published' : 'draft'
        });

        const savedScheda = await scheda.save();

        // Salva la scheda nel profilo dell'atleta se è un atleta
        if (user.userType === 'athlete') {
            user.savedSchede = user.savedSchede || [];
            if (!user.savedSchede.includes(savedScheda._id)) {
                user.savedSchede.push(savedScheda._id);
                await user.save();
            }
        }

        await savedScheda.populate('exercises.exerciseId');
        res.status(201).json(savedScheda);
    } catch (error) {
        console.error('Errore nella creazione della scheda:', error);
        res.status(400).json({
            message: 'Errore nella creazione della scheda',
            error: error.message
        });
    }
});

// Ottieni tutte le schede pubbliche con filtri
router.get('/', async (req, res) => {
    try {
        const { category, level, objective, type, duration, query } = req.query;
        let filter = {
            isPublic: true,
            publishStatus: 'published'
        };

        // Aggiungi i filtri se presenti
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (objective) filter.objective = objective;
        if (type) filter.type = type;
        if (duration) filter.duration = duration;

        // Aggiungi la ricerca per nome se presente una query
        if (query) {
            filter = {
                ...filter,
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            };
        }

        console.log('Filtri di ricerca:', filter);

        const schede = await Scheda.find(filter)
            .populate('creator', 'username userType')
            .populate('exercises.exerciseId')
            .sort('-createdAt');

        console.log('Schede trovate:', schede.length);
        res.json(schede);
    } catch (error) {
        console.error('Errore nella ricerca delle schede:', error);
        res.status(500).json({
            message: 'Errore nel recupero delle schede',
            error: error.message
        });
    }
});

// Ottieni le schede dell'utente (create e salvate)
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        let schede;
        if (user.userType === 'trainer') {
            // Trainer vede tutte le schede che ha creato
            schede = await Scheda.find({ creator: req.userId })
                .populate('exercises.exerciseId')
                .populate('creator', 'username userType')
                .sort('-createdAt');
        } else {
            // Atleta vede le schede create e salvate
            schede = await Scheda.find({
                $or: [
                    { creator: req.userId },
                    { _id: { $in: user.savedSchede || [] } }
                ]
            })
                .populate('exercises.exerciseId')
                .populate('creator', 'username userType')
                .sort('-createdAt');
        }

        res.json(schede);
    } catch (error) {
        console.error('Errore nel recupero delle schede utente:', error);
        res.status(500).json({
            message: 'Errore nel recupero delle schede',
            error: error.message
        });
    }
});

// Ottieni una scheda specifica
router.get('/:id', async (req, res) => {
    try {
        const scheda = await Scheda.findById(req.params.id)
            .populate('creator', 'username userType')
            .populate('exercises.exerciseId');

        if (!scheda) {
            return res.status(404).json({ message: 'Scheda non trovata' });
        }

        // Incrementa il contatore delle visualizzazioni
        scheda.totalViews = (scheda.totalViews || 0) + 1;
        await scheda.save();

        res.json(scheda);
    } catch (error) {
        res.status(500).json({
            message: 'Errore nel recupero della scheda',
            error: error.message
        });
    }
});

// Aggiorna una scheda
router.put('/:id', auth, async (req, res) => {
    try {
        const scheda = await Scheda.findById(req.params.id);
        if (!scheda) {
            return res.status(404).json({ message: 'Scheda non trovata' });
        }

        if (scheda.creator.toString() !== req.userId) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        const updatedScheda = await Scheda.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('exercises.exerciseId');

        res.json(updatedScheda);
    } catch (error) {
        res.status(400).json({
            message: 'Errore nell\'aggiornamento della scheda',
            error: error.message
        });
    }
});

// Elimina una scheda
router.delete('/:id', auth, async (req, res) => {
    try {
        const scheda = await Scheda.findById(req.params.id);
        if (!scheda) {
            return res.status(404).json({ message: 'Scheda non trovata' });
        }

        if (scheda.creator.toString() !== req.userId) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        await Scheda.deleteOne({ _id: req.params.id });

        // Rimuovi la scheda da tutti gli utenti che l'hanno salvata
        await User.updateMany(
            { savedSchede: req.params.id },
            { $pull: { savedSchede: req.params.id } }
        );

        res.json({ message: 'Scheda eliminata con successo' });
    } catch (error) {
        res.status(500).json({
            message: 'Errore nell\'eliminazione della scheda',
            error: error.message
        });
    }
});

// Salva una scheda (per atleti)
router.post('/save/:schedaId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.userType !== 'athlete') {
            return res.status(403).json({ message: 'Solo gli atleti possono salvare le schede' });
        }

        const scheda = await Scheda.findById(req.params.schedaId);
        if (!scheda) {
            return res.status(404).json({ message: 'Scheda non trovata' });
        }

        if (!user.savedSchede) {
            user.savedSchede = [];
        }

        if (!user.savedSchede.includes(scheda._id)) {
            user.savedSchede.push(scheda._id);
            await user.save();

            // Incrementa il contatore dei salvataggi
            scheda.totalSaves = (scheda.totalSaves || 0) + 1;
            await scheda.save();
        }

        res.json({ message: 'Scheda salvata con successo' });
    } catch (error) {
        res.status(500).json({
            message: 'Errore nel salvataggio della scheda',
            error: error.message
        });
    }
});

module.exports = router;