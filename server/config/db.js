const mongoose = require("mongoose");

const connectDB = async () => {
    // Проверка наличия переменной окружения MONGO_URI
    if (!process.env.MONGO_URI) {
        console.error("Ошибка: переменная окружения MONGO_URI не установлена.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB подключен");

        // Обработка события успешного подключения
        mongoose.connection.on("connected", () => {
            console.log("Соединение с MongoDB установлено");
        });

        // Обработка события потери соединения
        mongoose.connection.on("disconnected", () => {
            console.error("Потеряно соединение с MongoDB");
        });

        // Обработка ошибок подключения
        mongoose.connection.on("error", (err) => {
            console.error("Ошибка подключения к MongoDB:", err.message);
        });
    } catch (err) {
        console.error("Ошибка подключения к MongoDB:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
