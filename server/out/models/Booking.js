const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Types.ObjectId, ref: 'Service', required: true },
    dateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
}, { timestamps: true });

bookingSchema.statics.findByUserId = function(userId) {
    return this.find({ userId });
};

bookingSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

// Пример создания нового бронирования
const createBooking = async (userId, serviceId, dateTime) => {
    const booking = new Booking({ userId, serviceId, dateTime });
    return await booking.save();
};

module.exports = mongoose.model('Booking', bookingSchema);