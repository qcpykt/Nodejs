const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./out/routes/user');
const serviceRoutes = require('./out/routes/service');
const bookingRoutes = require('./out/routes/booking');
const reviewRoutes = require('./out/routes/review');

require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', () => userRoutes);
app.use('/api/services', () => serviceRoutes);
app.use('/api/bookings', () => bookingRoutes);
app.use('/api/reviews', () => reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));