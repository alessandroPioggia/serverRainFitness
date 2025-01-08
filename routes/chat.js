// routes/chat.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Schema per i contatti
const ContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

// Ottieni tutti i messaggi di una conversazione
router.get('/messages/:contactId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.userId, receiver: req.params.contactId },
                { sender: req.params.contactId, receiver: req.userId }
            ]
        })
            .sort('timestamp')
            .populate('sender', 'username userType')
            .populate('receiver', 'username userType');

        res.json(messages);
    } catch (error) {
        console.error('Errore nel recupero dei messaggi:', error);
        res.status(500).json({ message: 'Errore nel recupero dei messaggi' });
    }
});

// Invia un nuovo messaggio
router.post('/messages', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const message = new Message({
            sender: req.userId,
            receiver: receiverId,
            content,
            timestamp: new Date()
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username userType')
            .populate('receiver', 'username userType');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error);
        res.status(500).json({ message: 'Errore nell\'invio del messaggio' });
    }
});

// Aggiungi un nuovo contatto
router.post('/contacts/add', auth, async (req, res) => {
    try {
        const { contactId } = req.body;

        // Verifica se il contatto esiste già
        const existingContact = await Contact.findOne({
            userId: req.userId,
            contactId: contactId
        });

        if (!existingContact) {
            // Crea un nuovo contatto
            await Contact.create({
                userId: req.userId,
                contactId: contactId
            });

            // Crea anche il contatto inverso per il trainer
            await Contact.create({
                userId: contactId,
                contactId: req.userId
            });
        }

        res.status(201).json({ message: 'Contatto aggiunto con successo' });
    } catch (error) {
        console.error('Errore nell\'aggiunta del contatto:', error);
        res.status(500).json({ message: 'Errore nell\'aggiunta del contatto' });
    }
});

// Ottieni i contatti dell'utente
router.get('/contacts', auth, async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.userId })
            .populate('contactId', 'username userType photo');

        const contactsList = contacts.map(contact => ({
            _id: contact.contactId._id,
            username: contact.contactId.username,
            userType: contact.contactId.userType,
            photo: contact.contactId.photo
        }));

        res.json(contactsList);
    } catch (error) {
        console.error('Errore nel recupero dei contatti:', error);
        res.status(500).json({ message: 'Errore nel recupero dei contatti' });
    }
});

// Cerca trainer
router.get('/trainers', auth, async (req, res) => {
    try {
        const { search, specialty } = req.query;
        const query = { userType: 'trainer' };

        if (search) {
            query.$or = [
                { username: new RegExp(search, 'i') },
                { specialties: new RegExp(search, 'i') }
            ];
        }

        if (specialty && specialty !== 'all') {
            query.specialties = specialty;
        }

        const trainers = await User.find(query)
            .select('username userType photo specialties bio')
            .sort('username');

        res.json(trainers);
    } catch (error) {
        console.error('Errore nella ricerca dei trainer:', error);
        res.status(500).json({ message: 'Errore nella ricerca dei trainer' });
    }
});

// Rimuovi un contatto
router.delete('/contacts/:contactId', auth, async (req, res) => {
    try {
        await Contact.deleteOne({
            userId: req.userId,
            contactId: req.params.contactId
        });

        // Rimuovi anche il contatto inverso
        await Contact.deleteOne({
            userId: req.params.contactId,
            contactId: req.userId
        });

        res.json({ message: 'Contatto rimosso con successo' });
    } catch (error) {
        console.error('Errore nella rimozione del contatto:', error);
        res.status(500).json({ message: 'Errore nella rimozione del contatto' });
    }
});

// Segna i messaggi come letti
router.put('/messages/read/:senderId', auth, async (req, res) => {
    try {
        await Message.updateMany(
            {
                sender: req.params.senderId,
                receiver: req.userId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        res.json({ message: 'Messaggi segnati come letti' });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dei messaggi:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento dei messaggi' });
    }
});

module.exports = router;