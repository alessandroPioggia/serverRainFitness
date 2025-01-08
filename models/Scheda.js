const mongoose = require('mongoose');

const schedaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['forza', 'ipertrofia', 'resistenza', 'dimagrimento']
    },
    level: {
        type: String,
        required: true,
        enum: ['principiante', 'intermedio', 'avanzato']
    },
    objective: {
        type: String,
        required: true,
        enum: ['massa', 'definizione', 'perdita-peso', 'tonificazione']
    },
    type: {
        type: String,
        required: true,
        enum: ['fullbody', 'split', 'upperlower', 'push-pull-legs']
    },
    duration: {
        type: String,
        required: true,
        enum: ['30min', '45min', '60min', '90min']
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true
        },
        name: String,
        category: String,
        sets: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        reps: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        rest: {
            type: Number,
            required: true,
            min: 0,
            max: 300
        },
        notes: String,
        order: {
            type: Number,
            required: true
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    publishStatus: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    creatorType: {
        type: String,
        enum: ['athlete', 'trainer'],
        required: true
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rating: {
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalRatings: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalViews: {
        type: Number,
        default: 0
    },
    totalSaves: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        maxlength: 1000
    },
    tags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastPublishedAt: {
        type: Date
    }
});

// Middleware pre-save
schedaSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Se lo stato passa a published, aggiorna lastPublishedAt
    if (this.isModified('publishStatus') && this.publishStatus === 'published') {
        this.lastPublishedAt = new Date();
    }

    next();
});

// Metodi virtuali per le statistiche
schedaSchema.virtual('saveRate').get(function() {
    return this.totalViews ? (this.totalSaves / this.totalViews) * 100 : 0;
});

// Metodi statici
schedaSchema.statics.findByCategory = function(category) {
    return this.find({ category, isPublic: true, publishStatus: 'published' });
};

schedaSchema.statics.findByLevel = function(level) {
    return this.find({ level, isPublic: true, publishStatus: 'published' });
};

// Metodi dell'istanza
schedaSchema.methods.addReview = async function(userId, score, comment) {
    // Verifica se l'utente ha già recensito
    const existingReviewIndex = this.reviews.findIndex(
        review => review.user.toString() === userId.toString()
    );

    if (existingReviewIndex > -1) {
        // Aggiorna recensione esistente
        this.reviews[existingReviewIndex] = { user: userId, score, comment };
    } else {
        // Aggiungi nuova recensione
        this.reviews.push({ user: userId, score, comment });
    }

    // Ricalcola rating medio
    const totalScore = this.reviews.reduce((sum, review) => sum + review.score, 0);
    this.rating.averageScore = totalScore / this.reviews.length;
    this.rating.totalRatings = this.reviews.length;

    return this.save();
};

schedaSchema.methods.incrementViews = function() {
    this.totalViews += 1;
    return this.save();
};

schedaSchema.methods.incrementSaves = function() {
    this.totalSaves += 1;
    return this.save();
};

schedaSchema.methods.publish = function() {
    this.publishStatus = 'published';
    this.isPublic = true;
    this.lastPublishedAt = new Date();
    return this.save();
};

schedaSchema.methods.archive = function() {
    this.publishStatus = 'archived';
    this.isPublic = false;
    return this.save();
};

module.exports = mongoose.model('Scheda', schedaSchema);