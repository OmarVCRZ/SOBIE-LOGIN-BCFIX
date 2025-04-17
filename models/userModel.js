const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Password Hashing: https://www.npmjs.com/package/bcrypt

// Mongoose Schematics: https://mongoosejs.com/docs/guide.html
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['attendee', 'researcher', 'admin', 'null'],
        default: 'attendee'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // this has to be unique so there's no duplicates on accounts
    },
    // Email Verification Code
    tokenVerify: {
        type: String, // this is for email verification
        default: null // stores null in db if tokenVerify is not set manually (nothing was given)
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    // Password Reset 
    resetPasswordToken: { // stores unique secure token that's sent to user's email for password reset vertification
        type: String,
        default: null
    },
    resetPasswordExpires: { // timestamp for how long the reset link is valid
        type: Date,
        default: null
    },
    // Does the User have Research they will present in SOBIE.
    hasResearch: {
        type: Boolean,
        default: false
    },
    researchTitle: String,
    researchAbstract: String,
    coAuthors: [String], // Could be multiple (Array)
    sessionPreference: String // Do you want to attend a student, faculty, or no preference?
});
// Validation on password by comparing input to hashsed password
userSchema.methods.validatePW = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Exporting the Model: https://www.freecodecamp.org/news/module-exports-how-to-export-in-node-js-and-javascript/
module.exports = mongoose.model('UserSOBIE', userSchema);