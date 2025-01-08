const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['athlete', 'trainer', 'admin'],
        required: true
    },
    profile: {
        photo: { type: String, default: null },
        height: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        measurements: {
            chest: { type: Number, default: 0 },
            waist: { type: Number, default: 0 },
            hips: { type: Number, default: 0 },
            biceps: { type: Number, default: 0 },
            thighs: { type: Number, default: 0 }
        }
    },

    // Campi specifici per trainer
    specialties: [{
        type: String,
        enum: ['bodybuilding', 'powerlifting', 'fitness', 'calisthenics', 'weightloss']
    }],
    bio: {
        type: String,
        maxlength: 1000
    },
    cv: {
        type: String  // URL o percorso del file
    },
    // Campi specifici per admin
    adminCode: {
        type: String
    },
    // Schede salvate (per atleti)
    savedSchede: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheda'
    }],
    // Sistema di gamification
    gamification: {
        level: {
            type: Number,
            default: 1
        },
        xp: {
            type: Number,
            default: 0
        },
        badges: [{
            type: Number
        }],
        activeChallenges: [{
            type: Number
        }]
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pre-save per aggiornare updatedAt
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Metodo per verificare se l'utente è un trainer
userSchema.methods.isTrainer = function() {
    return this.userType === 'trainer';
};

// Metodo per verificare se l'utente è un atleta
userSchema.methods.isAthlete = function() {
    return this.userType === 'athlete';
};

// Metodo per verificare se l'utente è un admin
userSchema.methods.isAdmin = function() {
    return this.userType === 'admin';
};

// Metodo per aggiungere XP
userSchema.methods.addXP = async function(amount) {
    this.gamification.xp += amount;
    // Calcola se l'utente dovrebbe salire di livello
    const xpPerLevel = 100; // XP necessari per ogni livello
    const newLevel = Math.floor(this.gamification.xp / xpPerLevel) + 1;

    if (newLevel > this.gamification.level) {
        this.gamification.level = newLevel;
        // Qui potresti aggiungere logica per ricompense di livello
    }

    await this.save();
    return {
        currentXP: this.gamification.xp,
        currentLevel: this.gamification.level,
        leveledUp: newLevel > this.gamification.level
    };
};

module.exports = mongoose.model('User', userSchema);
