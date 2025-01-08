const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']
    },
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    description: String,
    instructions: [String],
    primaryMuscles: [String],
    secondaryMuscles: [String],
    equipment: [String]
});

module.exports = mongoose.model('Exercise', exerciseSchema);