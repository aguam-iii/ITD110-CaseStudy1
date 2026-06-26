const mongoose = require('mongoose');

const clearanceStageSchema = new mongoose.Schema({
    office: {
        type: String,
        required: true,
        enum: ['Library', 'Laboratory', 'Finance', 'Health Center', 'Registrar']
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Cleared', 'Hold'],
        default: 'Pending'
    },
    feedback: {
        type: String,
        default: ''
    },
    staffName: {
        type: String,
        default: ''
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { _id: false });

const documentRequestSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    studentCourse: {
        type: String,
        required: true
    },
    documentType: {
        type: String,
        required: true,
        enum: ['Transcript (TOR)', 'Certification', 'Diploma'],
        default: 'Transcript (TOR)'
    },
    globalStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Fully Cleared', 'Ready for Pickup', 'Dispatched'],
        default: 'Pending'
    },
    clearanceHistory: [clearanceStageSchema],
    registrarNotes: {
        type: String,
        default: ''
    },
    dispatchCoordinates: {
        method: {
            type: String,
            enum: ['In-Person', 'Courier', 'Email'],
            default: null
        },
        date: Date,
        trackingNumber: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
