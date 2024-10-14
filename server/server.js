const express = require("express");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./out/routes/auth"); // Подключите маршруты аутентификации
const userRoutes = require("./out/routes/user"); // Подключите маршруты пользователей
const userManagementRoutes = require("./out/routes/userManagement"); // Подключите маршрут управления пользователями
const adminRoutes = require("./out/routes/admin"); // Подключите маршруты администрирования
const serviceRoutes = require("./out/routes/service"); // Подключите маршруты услуг
const bookingRoutes = require("./out/routes/bookingRoutes"); // Подключите маршруты бронирования
const reviewRoutes = require('./out/routes/reviewRoutes');
const routes = require('./out/routes/bookingRoutes');
const errorMiddleware = require('./out/middleware/errorMiddleware');
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config(); // Загружаем переменные окружения

const app = express();
connectDB(); // Подключение к базе данных

// Проверка переменных окружения
const requiredEnvVars = ["MONGO_URI", "PORT", "JWT_SECRET"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Ошибка: переменная окружения ${varName} не установлена.`);
    process.exit(1);
  }
});

// Настройки приложения
app.set("trust proxy", "loopback"); // Доверие к прокси-серверам

// Middleware
// Применение CORS
app.use(cors({
    origin: '*', // Укажите URL вашего клиентского приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userToken', 'role'],
  credentials: true
}));
app.use(bodyParser.json()); // Парсинг JSON
app.use(morgan("dev")); // Логирование запросов
app.use(helmet()); // Защита приложения

// Ограничение частоты запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит на 100 запросов за 15 минут
});
app.use(limiter);

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/user-management', userManagementRoutes); // Подключение маршрута управления пользователями
//Использование curl -X PATCH 'https://qcpykt-server.glitch.me/api/user-management/make-admin/qcplayer@mail.ru'

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
      message: err.message || "Что-то пошло не так!", 
      path: req.originalUrl 
   });
});

// Подключаем middleware для обработки ошибок
app.use(errorMiddleware);

// Запуск сервера
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Корректное завершение работы сервера
process.on("SIGINT", () => {
  console.log("Завершение работы сервера...");
  server.close(() => {
    console.log("Сервер закрыт.");
    process.exit(0);
  });
});

// Простой маршрут для проверки
app.get("/api/test", (req, res) => {
  res.json({ message: "API работает!" });
});

// Корневой маршрут
app.get("/", (req, res) => {
  res.send("Hello World!");
});