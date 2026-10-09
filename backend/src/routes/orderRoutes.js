const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('customer'), orderController.createOrder);
router.post('/verify', authenticateToken, authorizeRoles('customer'), orderController.verifyPayment);
router.get('/', authenticateToken, authorizeRoles('customer', 'artisan', 'admin'), orderController.getOrders);
router.put('/:id', authenticateToken, authorizeRoles('artisan', 'admin'), orderController.updateOrderStatus);

// Dashboard stats endpoints
router.get('/artisan/earnings', authenticateToken, authorizeRoles('artisan'), orderController.getArtisanEarnings);
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), orderController.getAdminStats);

module.exports = router;
