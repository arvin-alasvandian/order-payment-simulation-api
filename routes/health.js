const { Router } = require('express');
const router = Router();

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'order-payment-simulation-api',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
