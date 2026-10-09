const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, reviewController.addReview);
router.get('/:productId', reviewController.getReviewsByProduct);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
