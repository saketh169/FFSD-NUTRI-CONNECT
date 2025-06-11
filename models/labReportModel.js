const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dietitianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dietitian',
        required: true
    },
    name: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        required: false
    },
    address: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    healthConcerns: {
        type: [String],
        enum: ['diabetes', 'thyroid', 'bloodPressure', 'cardiac', 'hormonal', ''],
        default: []
    },
    additionalInfo: {
        type: String,
        required: false
    },
    // File uploads
    generalHealthReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    bloodTestReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    diabetesReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    thyroidReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    bloodSugarReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    bloodPressureReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    cardiovascularReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    cardiacHealthReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    ecgReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    hormonalProfileReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    endocrineReport: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LabReport', labReportSchema);