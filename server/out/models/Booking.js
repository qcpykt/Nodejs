const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }, // Используем ObjectId для ссылки на пользователя
    serviceId: { type: mongoose.Types.ObjectId, ref: 'Service', required: true }, // Используем ObjectId для ссылки на услугу
    dateTime: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
}, { timestamps: true }); // Автоматически добавляет поля createdAt и updatedAt

// Пример статического метода для получения всех бронирований пользователя
BookingSchema.statics.findByUserId = function(userId) {
    return this.find({ userId });
};

// Пример метода для обновления статуса бронирования
BookingSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

module.exports = mongoose.model('Booking', BookingSchema);