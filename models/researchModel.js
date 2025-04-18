const mongoose = require('mongoose');

// Research Section Data
const researchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSOBIE', required: true },
    title: String,
    abstract: String,
    session: String,
    coAuthors: [String],
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Research', researchSchema);
