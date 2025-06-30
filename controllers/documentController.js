const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/document');
const gTTS = require('gtts');
const cloudinary = require('../config/cloudinary')



exports.uploadDocument = async (req, res) => {
  const files = req.files;
  const userId = req.user.id;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const savedDocs = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';
    let cloudinaryUrl = '';

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'dms_documents',
        resource_type: 'auto',
      });

      cloudinaryUrl = result.secure_url;

      // Fetch the file from Cloudinary
      const response = await axios.get(cloudinaryUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);

      // Extract text based on file type
      if (ext === '.pdf') {
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      }

      // Save to MongoDB
      const doc = new Document({
        cloudinaryUrl,
        originalName: file.originalname,
        fileType: ext,
        text,
        user: userId,
        size: file.size,
        uploadDate: new Date(),
        mimetype: file.mimetype,
      });

      await doc.save();
      savedDocs.push(doc);

      // Cleanup temp local file
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error(`❌ Failed to process file: ${file.originalname}`, err);
    }
  }

  res.status(201).json({ message: 'Files uploaded', documents: savedDocs });
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};

exports.getAudioFromDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id });
    if (!doc || !doc.text) return res.status(404).json({ message: 'Document not found or no text available' });

    const gtts = new gTTS(doc.text, 'en');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="document-${doc._id}.mp3"`
    });

    gtts.stream().pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to convert text to speech' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    console.log('Trying to delete doc:', doc);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};


