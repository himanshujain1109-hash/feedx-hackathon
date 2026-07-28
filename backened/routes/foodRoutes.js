const express = require('express');
const {
  listFood,
  getFood,
  createFood,
  claimFood,
  updateFoodStatus,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', listFood);
router.post('/', protect, createFood);
router.get('/:id', getFood);
router.post('/:id/claim', protect, claimFood);
router.patch('/:id/status', protect, updateFoodStatus);

module.exports = router;
