const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  getAudioFromDocument
} = require('../controllers/documentController');


/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management and processing
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload one or more documents (PDF/DOCX)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, upload.array("files"), uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all uploaded documents for the authenticated user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user documents
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch documents
 */
router.get("/", authMiddleware, getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a single document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Document ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getDocumentById);

/**
 * @swagger
 * /api/documents/audio/{id}:
 *   get:
 *     summary: Convert a document’s text content into an audio stream (text-to-speech)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Document ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MP3 audio stream returned
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid ID or text-to-speech conversion error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found or no text available
 *       500:
 *         description: Server error
 */
router.get('/audio/:id', authMiddleware, getAudioFromDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Document ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Failed to delete document
 */
router.delete("/:id", authMiddleware, deleteDocument);

module.exports = router;
