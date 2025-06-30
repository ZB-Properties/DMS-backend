const fs = require('fs');
const path = require('path');
const axios = require('axios'); 
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/document');
const gTTS = require('gtts');
const cloudinary = require('../config/cloudinary');


exports.uploadDocument = async (req, res) => {
  const files = req.files;
  const userId = req.user.id;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const savedDocs = [];

  for (const file of files) {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase(); // extract file extension
    let text = '';

    try {
      const fileUrl = file.path; // Cloudinary URL from multer-storage-cloudinary

      // Fetch file from Cloudinary
      const axios = require('axios');
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Extract text
      if (ext === '.pdf') {
        const data = await require('pdf-parse')(buffer);
        text = data.text;
      } else if (ext === '.docx') {
        const result = await require('mammoth').extractRawText({ buffer });
        text = result.value;
      }

      const doc = new Document({
        cloudinaryUrl: fileUrl,
        originalName: file.originalname,
        fileType: ext,
        mimetype: file.mimetype,
        size: file.size,
        text,
        user: userId,
        uploadDate: new Date(),
      });

      await doc.save();
      savedDocs.push(doc);
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
      'Content-Disposition': `inline; filename="document-${doc._id}.mp3"`,
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
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }


    const publicId = doc.cloudinaryUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`dms_documents/${publicId}`, { resource_type: 'raw' });

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};
