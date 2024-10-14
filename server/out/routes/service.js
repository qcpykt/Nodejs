const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const router = express.Router();

// Валидация для добавления новой услуги
const serviceValidation = [
    body('title').notEmpty().withMessage('Название услуги обязательно').isLength({ min: 1 }).withMessage('Минимальная длина заголовка 1 символ'),
    body('description').notEmpty().withMessage('Описание услуги обязательно').isLength({ min: 1 }).withMessage('Минимальная длина описания 1 символ'),
    body('price').isNumeric().withMessage('Цена должна быть числом').isFloat({ min: 0 }).withMessage('Цена должна быть неотрицательной'),
    body('categoryId').isMongoId().withMessage('Некорректный ID категории')
];

// Получение всех услуг
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавление новой услуги
router.post('/', serviceValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, categoryId, isFeatured } = req.body;

    try {
        const service = new Service({ title, description, price, categoryId, isFeatured });
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Обновление услуги
router.put('/:id', serviceValidation, async (req, res) => {
    const { title, description, price, categoryId, isFeatured } = req.body;

    try {
        const service = await Service.findByIdAndUpdate(req.params.id, { title, description, price, categoryId, isFeatured }, { new: true });
        if (!service) return res.status(404).send('Услуга не найдена');
        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Удаление услуги
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndRemove(req.params.id);
        if (!service) return res.status(404).send('Услуга не найдена');
        res.json({ msg: 'Услуга удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Получение услуги по ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).send('Услуга не найдена');
        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении услуги');
    }
});

module.exports = router;