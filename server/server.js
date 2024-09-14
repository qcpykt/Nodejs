const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const userRoutes = require("./out/routes/user");
const serviceRoutes = require("./out/routes/service");
const bookingRoutes = require("./out/routes/booking");
const reviewRoutes = require("./out/routes/review");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
connectDB();

// Проверка переменных окружения
const requiredEnvVars = ["MONGO_URI", "PORT", "JWT_SECRET"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Ошибка: переменная окружения ${varName} не установлена.`);
    process.exit(1);
  }
});

// Trust proxy setting
app.set("trust proxy", "loopback"); // Измените на "false" или укажите конкретный IP-адрес

// Middleware для обработки CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Установите конкретный источник вместо "*", если необходимо
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Если запрос является предзапросом (OPTIONS), отправляем ответ
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middleware для парсинга тела запроса
app.use(bodyParser.json());

// Логи запросов
app.use(morgan("dev"));

// Защита приложения
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит на 100 запросов за 15 минут
  keyGenerator: (req) => req.ip, // Используйте реальный IP-адрес клиента
});
app.use(limiter);

// Обработчики маршрутов
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Что-то пошло не так!" });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  // Close database connections and clean up
  process.exit(0);
});

// Простой маршрут для проверки
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
