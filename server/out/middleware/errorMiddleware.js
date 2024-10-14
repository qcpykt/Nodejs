const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Что-то пошло не так!' });
};

module.exports = errorMiddleware;