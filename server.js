const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// health
const healthRoutes = require('./routes/health');
app.use('/', healthRoutes);

// orders
const ordersRoutes = require('./routes/orders');
app.use('/orders', ordersRoutes);

// payments  <-- add these two lines
const paymentsRoutes = require('./routes/payments');
app.use('/payments', paymentsRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

