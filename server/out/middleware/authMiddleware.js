// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Импортируйте вашу модель пользователя

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    //console.log('Token:', token); // Логируем токен

    if (!token) {
        return res.status(401).send('Доступ запрещен. Токен не предоставлен.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log('Decoded token:', decoded); // Логируем декодированный токен
        req.user = await User.findById(decoded.id);
        //console.log('User found:', req.user); // Логируем найденного пользователя

        if (!req.user) {
            return res.status(401).send('Доступ запрещен. Пользователь не найден.');
        }
        next();
    } catch (err) {
        console.error(err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send('Доступ запрещен. Токен истёк.');
        }
        res.status(401).send('Доступ запрещен. Неверный токен.');
    }
};

module.exports = auth; // Экспортируем middleware