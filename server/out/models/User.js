// out/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Добавляем поле userId
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, required: true },
    userName: { type: String, required: false },
    phone: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^\+?[1-9]\d{1,14}$/ // Валидация телефона (например, международный формат)
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /.+\@.+\..+/ // Валидация email
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['client', 'executor', 'admin'], // Добавляем роль админа
        default: 'client' // По умолчанию при регистрации - клиент
    },
    points: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }, // Количество оставленных отзывов
}, { timestamps: true }); // Добавляем таймстампы

// Хеширование пароля перед сохранением
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Если пароль не изменился, пропускаем хеширование
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Метод для проверки пароля
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Получение всех пользователей
UserSchema.statics.getAllUsers = function() {
    return this.find();
};

// Метод для получения информации о пользователе без пароля
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // Удаляем пароль из объекта пользователя
    delete userObject.password;

    return userObject;
};

module.exports = mongoose.model('User', UserSchema);