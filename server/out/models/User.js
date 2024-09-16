const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /.+\@.+\..+/ // Валидация email
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'executor'], default: 'client' },
    points: { type: Number, default: 0 },
}, { timestamps: true }); // Добавляем таймстампы

module.exports = mongoose.model('User', UserSchema);