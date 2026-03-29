const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vital-essentials';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use('/api/products', require('./server/routes/products'));
app.use('/api/orders', require('./server/routes/orders'));
app.use('/api/checkout', require('./server/routes/checkout'));

app.get('/', (req, res) => {
  res.json({ message: 'Vital Essentials API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});