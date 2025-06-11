const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true, unique: true },
    answer: { type: String, required: true }
});

// Message Schema
const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        index: true
    },
    receiverId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient message retrieval
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Define models
const Question = mongoose.model('Question', questionSchema);
const Message = mongoose.model('Message', messageSchema);

// Export models in a single object
module.exports = { Question, Message };