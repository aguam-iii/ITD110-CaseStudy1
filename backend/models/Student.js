const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);