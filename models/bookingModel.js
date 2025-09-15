const mongoose = require('mongoose');

const bookedSlotsSchema = new mongoose.Schema({
    dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietitian', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }, // New field for username
    date: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    time: {
        type: String,
        required: true,
        match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format (00:00-23:59)']
    },
    consultationType: {
        type: String,
        enum: ['Online', 'In-person'],
        required: true
    },
    status: {
        type: String,
        enum: ['Booked', 'Cancelled', 'Completed'],
        default: 'Booked'
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'UPI', 'PayPal'],
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
bookedSlotsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance and uniqueness
bookedSlotsSchema.index(
    { dietitianId: 1, date: 1, time: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'Booked' } }
);
bookedSlotsSchema.index({ userId: 1, dietitianId: 1, date: 1, status: 1 });
bookedSlotsSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { status: 'Cancelled' } }
);

const BookedSlots = mongoose.model('BookedSlots', bookedSlotsSchema);

// Function to mark booked slots before current date as completed
async function markPastBookingsAsCompleted() {
    try {
        const today = new Date();
        // Format today's date as YYYY-MM-DD
        const todayString = today.toISOString().split('T')[0];
        // console.log(`Current date: ${todayString}`);

        // Find all booked slots before today for debugging
        const pastBookings = await BookedSlots.find({
            status: 'Booked',
            date: { $lt: todayString }
        }).select('date time status');

        console.log(`Found ${pastBookings.length} booked slots before ${todayString}:`, pastBookings);

        const result = await BookedSlots.updateMany(
            {
                status: 'Booked',
                date: { $lt: todayString }
            },
            {
                $set: { 
                    status: 'Completed',
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Marked ${result.modifiedCount} past bookings as Completed`);
    } catch (error) {
        console.error('Error marking past bookings as completed:', error);
    }
}

// Run the function immediately when the module is loaded
markPastBookingsAsCompleted();

module.exports = { BookedSlots };