const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/document');
const gTTS = require('gtts');

exports.uploadDocument = async (req, res) => {
  const files = req.files;
  const userId = req.user.id;

  if (!files || files.length === 0)
    return res.status(400).json({ message: 'No files uploaded' });

  const savedDocs = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';

    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else if (ext === '.docx') {
        const data = await mammoth.extractRawText({ path: file.path });
        text = data.value;
      }

      const doc = new Document({
        filename: file.filename,
        originalName: file.originalname,
        fileType: ext,
        text,
        user: userId,
        size: file.size,
        uploadDate: new Date(),
        mimetype: file.mimetype,
        path: file.path
      });

      await doc.save();
      savedDocs.push(doc);
    } catch (err) {
      console.error(`Failed to process file: ${file.originalname}`, err);
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


