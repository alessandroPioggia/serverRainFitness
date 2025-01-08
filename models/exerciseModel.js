const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    category: {
        type: String,
        required: true,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']
    },
    description: {
        type: String,
        required: true
    },
    equipment: {
        type: [String],
        default: []
    },
    primaryMuscles: {
        type: [String],
        required: true
    },
    secondaryMuscles: {
        type: [String],
        default: []
    },
    instructions: {
        type: [String],
        required: true
    },
    tips: {
        type: [String],
        default: []
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;