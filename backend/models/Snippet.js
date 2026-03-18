const mongoose = require('mongoose');
const shortid = require('shortid');

const fileSchema = new mongoose.Schema({
  name: { type: String, default: 'untitled.txt' },
  content: { type: String, default: '' },
  language: { type: String, default: 'plaintext' }
});

const snippetSchema = new mongoose.Schema({
  snippetId: {
    type: String,
    required: true,
    default: shortid.generate, 
    unique: true
  },
  files: [fileSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Snippet', snippetSchema);