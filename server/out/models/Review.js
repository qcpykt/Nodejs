//out/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }, // Используем ObjectId для ссылки на пользователя
    serviceId: { type: mongoose.Types.ObjectId, ref: 'Service', required: true }, // Используем ObjectId для ссылки на услугу
    rating: { 
        type: Number, 
        required: true, 
        min: 0,  // Минимальное значение рейтинга
        max: 5   // Максимальное значение рейтинга
    },
    comment: { type: String, required: true },
}, { timestamps: true }); // Добавляем таймстампы

module.exports = mongoose.model('Review', ReviewSchema);