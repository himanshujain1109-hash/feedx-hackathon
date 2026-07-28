const express = require('express');
const { listNgos, createNgo } = require('../controllers/ngoController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', listNgos);
router.post('/', protect, createNgo);

module.exports = router;
