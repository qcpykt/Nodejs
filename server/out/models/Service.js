const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { 
        type: Number, 
        required: true, 
        min: 0 // Убедитесь, что цена неотрицательная
    },
    categoryId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Category', // Предполагается, что у вас есть коллекция категорий
        required: true 
    },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true }); // Добавляем таймстампы

module.exports = mongoose.model('Service', ServiceSchema);