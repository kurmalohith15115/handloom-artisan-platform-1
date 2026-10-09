const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, authorizeRoles('artisan'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('artisan'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('artisan', 'admin'), productController.deleteProduct);

module.exports = router;
