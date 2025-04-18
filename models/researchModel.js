const mongoose = require('mongoose');

`
The Purpose of this file is it defines the schema and model for research submissions in the SOBIE ssytem using Mongoose.
`
// Research Section Data
const researchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSOBIE', required: true },
    title: String,
    abstract: String,
    session: String,
    coAuthors: [String],
    submittedAt: { type: Date, default: Date.now }
});

// Makes model available to be imported in other files (allows create, read, and update)
module.exports = mongoose.model('Research', researchSchema);
