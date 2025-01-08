const mongoose = require('mongoose');

const cookiePreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    essential: {
        type: Boolean,
        default: true,
        required: true
    },
    analytics: {
        type: Boolean,
        default: false,
        required: true
    },
    marketing: {
        type: Boolean,
        default: false,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CookiePreference', cookiePreferenceSchema);