const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');  // Aggiungi questa riga
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');

// Ottieni profilo utente
router.get('/profile', auth, async (req, res) => {  // Assicurati che ci sia una funzione di callback
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('savedSchede');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
});

// Aggiorna profilo utente
router.put('/profile', auth, upload.single('photo'), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Verifica email duplicata
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({
                email: req.body.email,
                _id: { $ne: req.userId }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'Email già in uso' });
            }
        }

        // Verifica username duplicato
        if (req.body.username && req.body.username !== user.username) {
            const usernameExists = await User.findOne({
                username: req.body.username,
                _id: { $ne: req.userId }
            });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username già in uso' });
            }
        }

        // Costruisci oggetto aggiornamento
        const updateData = {};

        // Dati base
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.username) updateData.username = req.body.username;

        // Password
        if (req.body.currentPassword && req.body.newPassword) {
            const isValidPassword = await bcrypt.compare(
                req.body.currentPassword,
                user.password
            );
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Password corrente non valida' });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.newPassword, salt);
        }

        // Profilo
        updateData.profile = {
            ...user.profile,
            height: req.body.height || user.profile.height,
            weight: req.body.weight || user.profile.weight,
            measurements: {
                chest: req.body.measurements?.chest || user.profile.measurements?.chest,
                waist: req.body.measurements?.waist || user.profile.measurements?.waist,
                hips: req.body.measurements?.hips || user.profile.measurements?.hips,
                biceps: req.body.measurements?.biceps || user.profile.measurements?.biceps,
                thighs: req.body.measurements?.thighs || user.profile.measurements?.thighs
            }
        };

        // Foto profilo
        if (req.file) {
            updateData.profile.photo = `/uploads/profiles/${req.file.filename}`;
        }

        // Campi specifici per trainer
        if (user.userType === 'trainer') {
            if (req.body.specialties) updateData.specialties = req.body.specialties;
            if (req.body.bio) updateData.bio = req.body.bio;
        }

        // Aggiorna utente
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Errore aggiornamento profilo:', error);
        res.status(500).json({
            message: 'Errore durante l\'aggiornamento del profilo',
            error: error.message
        });
    }
});

// Aggiorna foto profilo
router.put('/profile/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nessuna foto caricata' });
        }

        const updateData = {
            'profile.photo': `/uploads/profiles/${req.file.filename}`
        };

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante l\'upload della foto',
            error: error.message
        });
    }
});

// Aggiorna misurazioni
router.put('/profile/measurements', auth, async (req, res) => {
    try {
        const { measurements } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'profile.measurements': measurements } },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante l\'aggiornamento delle misure',
            error: error.message
        });
    }
});

// Ottieni tutti i trainer (per la ricerca)
router.get('/trainers', async (req, res) => {
    try {
        const trainers = await User.find({
            userType: 'trainer',
        }).select('username profile specialties bio');

        res.json(trainers);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei trainer' });
    }
});

module.exports = router;