
//out/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        minlength: 1 // Минимальная длина заголовка
    },
    description: { 
        type: String, 
        required: true, 
        minlength: 1 // Минимальная длина описания
    },
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
    isFeatured: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); // Добавляем таймстампы

// Метод для получения информации об услуге без идентификатора
ServiceSchema.methods.toJSON = function() {
    const service = this;
    const serviceObject = service.toObject();

    // Удаляем ненужные поля, если это необходимо
    return serviceObject;
};

// Метод для обновления услуги
ServiceSchema.methods.updateService = async function(data) {
    Object.assign(this, data); // Обновляем поля услуги новыми данными
    await this.save(); // Сохраняем изменения
};

module.exports = mongoose.model('Service', ServiceSchema);