const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filename: String,
    originalName: String,
    fileType: String,
    mimetype: String,
    size: Number,
    path: String,
    text: String,
    uploadDate: { type: Date, default: Date.now }
});

documentSchema.index({ text: 'text', originalName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
