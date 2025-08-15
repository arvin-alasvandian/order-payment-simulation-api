const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const healthRoutes = require('./routes/health');
app.use('/', healthRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

