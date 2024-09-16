const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken'); // Импорт JWT для аутентификации
const router = express.Router();

// Регистрация пользователя
router.post('/register', [
    body('name').notEmpty().withMessage('Имя обязательно'),
    body('phone').notEmpty().withMessage('Телефон обязателен'),
    body('email').isEmail().withMessage('Некорректный email').notEmpty().withMessage('Email обязателен'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Пользователь уже существует' });

        user = new User({ name, phone, email, password: await bcrypt.hash(password, 10) });
        await user.save();
        res.status(201).json({ msg: 'Пользователь зарегистрирован' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ msg: 'Вход выполнен успешно', token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;