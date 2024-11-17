const express = require('express');
const { uploadFile, listFiles, generateDownloadLink, downloadFile } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/list', authMiddleware, listFiles);
router.get('/download-file/:id', authMiddleware, generateDownloadLink);
router.get('/download/:id', authMiddleware, downloadFile);

module.exports = router;
