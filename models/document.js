const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalName: String,
  fileType: String,
  mimetype: String,
  size: Number,
  cloudinaryUrl: String,           
  cloudinaryPublicId: String,      
  text: String,
  uploadDate: { type: Date, default: Date.now }
});


documentSchema.index({ text: 'text', originalName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
