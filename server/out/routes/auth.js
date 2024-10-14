const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Регистрация пользователя
router.post('/register', [
    body('userId').notEmpty().withMessage('Идентификатор пользователя обязателен'),
    body('fistName').notEmpty().withMessage('Имя обязательно'),
    body('lastName').notEmpty().withMessage('Фамилия обязательна'),
    body('middleName').notEmpty().withMessage('Отчество обязательно'),
    body('userName'),
    body('phone').notEmpty().withMessage('Телефон обязателен'),
    body('email').isEmail().withMessage('Некорректный email').notEmpty().withMessage('Email обязателен'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, firstName, lastName, middleName, nickName, phone, email, password } = req.body;

    try {
        // Проверка на существующего пользователя с таким email
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Пользователь с таким email уже существует' });

        // Проверка на существующего пользователя с таким номером телефона
        user = await User.findOne({ phone });
        if (user) return res.status(400).json({ msg: 'Пользователь с таким номером телефона уже существует' });

        // Создание нового пользователя
        user = new User({
            userId,
            firstName,
            lastName,
            middleName,
            nickName,
            phone,
            email,
            password: await bcrypt.hash(password, 10), // Хэширование пароля
            role: 'client' // Установите роль по умолчанию
        });

        await user.save();

        // Генерация токена
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Возвращаем userId и token
        res.status(201).json({ userId: user._id, userToken: token, role: user.role, msg: 'Пользователь успешно зарегистрирован' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
});

// Вход пользователя
router.post('/login', [
    body('email').isEmail().withMessage('Некорректный email').notEmpty().withMessage('Email обязателен'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Неверные учетные данные' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Неверные учетные данные' });

        // Генерация JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' }); // Новый refresh токен

        res.json({ msg: 'Вход выполнен успешно', token, refreshToken, userId: user._id, role: user.role });
            console.log('User found:', user); // Логирование найденного пользователя
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
});

// Обновление токена
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ msg: 'Refresh токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ msg: 'Пользователь не найден' });
        }

        // Генерация нового access токена
        const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token: newToken });
    } catch (err) {
        console.error(err);
        res.status(403).json({ msg: 'Неверный refresh токен' });
    }
});

module.exports = router;