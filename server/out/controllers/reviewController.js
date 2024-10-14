const Review = require('../models/Review');
const User = require('../models/User'); // Импортируем модель пользователя

// Получение отзывов для определенной услуги
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ serviceId: req.params.serviceId })
            .populate('userId', 'firstName lastName middleName reviewCount'); // Заполняем только нужные поля пользователя
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении отзывов' });
    }
};

// Добавление нового отзыва
const addReview = async (req, res) => {
    const { userId, serviceId, rating, comment } = req.body;

    // Проверка наличия всех полей


    try {
        const newReview = new Review({ userId, serviceId, rating, comment });
        await newReview.save();

        // Увеличиваем счетчик отзывов у пользователя
        await User.findByIdAndUpdate(userId, { $inc: { reviewCount: 1 } });

        res.status(201).json(newReview);
    } catch (error) {
              console.error("Ошибка при получении отзывов:", error.message); // Выводим сообщение об ошибке
        res.status(500).json({ msg: "Ошибка при добавлении отзыва.", error });
    }
};

module.exports = {
    addReview,
    getReviews,
};