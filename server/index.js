// Updated index.js that includes all routes
const express = require('express');
// other imports
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const app = express();
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
// start server
