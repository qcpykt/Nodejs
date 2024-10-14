const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');
const auth = require('../middleware/authMiddleware'); // Импортируйте middleware для аутентификации
const { v4: uuidv4 } = require('uuid');


const router = express.Router();

// Получение всех пользователей (только для администраторов)
router.get('/users', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен'); }
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении пользователей');
    }
});

// Добавление нового пользователя (только для администраторов)
router.post('/users', auth, async (req, res) => {
    // Проверка, что текущий пользователь является администратором
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    const { firstName, lastName, middleName, userName, phone, email, password, role } = req.body;

    try {
        // Проверка на существование пользователя с таким же email или телефоном
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email или телефоном уже существует' });
        }

        // Генерация уникального userId (можно использовать библиотеку uuid)
        const userId = uuidv4(); /* генерация userId, например, с помощью uuid или другого метода */;

        // Создание нового пользователя
        const newUser = new User({
            userId,
            firstName,
            lastName,
            middleName,
            userName,
            phone,
            email,
            password, // Пароль будет автоматически хешироваться благодаря pre('save')
            role: role || 'client', // Установите роль, если она не указана
        });

        await newUser.save(); // Сохранение нового пользователя в базе данных
        res.status(201).json(newUser); // Отправка ответа с созданным пользователем
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при добавлении пользователя');
    }
});

router.put('/users/:id', auth, async (req, res) => {
    // Проверка роли пользователя
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    const userId = req.params.id;
    const updatedUserData = req.body;

    try {
        // Находим пользователя по ID и обновляем его данные
        const user = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        // Возвращаем обновленного пользователя
        return res.json(user); // Отправляем только обновленного пользователя
    } catch (err) {
        console.error(err);
        return res.status(500).send('Ошибка при обновлении пользователя');
    }
});

// Удаление пользователя (только для администраторов)
router.delete('/users/:id', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }
  
    const userId = req.params.id;
  
    try {
      const user = await User.findByIdAndDelete(userId);
       if (!user) {
               return res.status(404).json({ message: 'Пользователь не найден' });
           }
      return res.status(200).json({ message: 'Пользователь успешно удален' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении пользователя');
    }
});

// Получение всех услуг (только для администраторов)
router.get('/services', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      console.log('requser:', req.user);
      console.log('requserrole:', req.role);
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении услуг');
    }
});

// Получение всех отзывов (только для администраторов)
router.get('/reviews', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении отзывов');
    }
});

// Удаление услуги (только для администраторов)
router.delete('/services/:id', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const service = await Service.findByIdAndRemove(req.params.id);
        if (!service) return res.status(404).send('Услуга не найдена');
        res.json({ msg: 'Услуга удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении услуги');
    }
});

// Удаление отзыва (только для администраторов)
router.delete('/reviews/:id', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const review = await Review.findByIdAndRemove(req.params.id);
        if (!review) return res.status(404).send('Отзыв не найден');
        res.json({ msg: 'Отзыв удален' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении отзыва');
    }
});

module.exports = router;