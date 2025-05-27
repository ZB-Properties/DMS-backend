const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const docCtrl = require('../controllers/documentController');

router.post('/', authMiddleware, upload.array('files'), docCtrl.uploadDocument);
router.get('/', authMiddleware, docCtrl.getDocuments);
router.get('/:id', authMiddleware, docCtrl.getDocumentById);
router.get('/:id/audio', authMiddleware, docCtrl.getAudioFromDocument);
router.delete('/:id', authMiddleware, docCtrl.deleteDocument);


module.exports = router;
