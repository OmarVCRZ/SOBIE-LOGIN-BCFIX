// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Password Hashing: https://www.npmjs.com/package/bcrypt

`
The purpose of this file is that it defines the schema and structure of a user account in MongoDB (using Mongoose).
`
// Mongoose Schematics: https://mongoosejs.com/docs/guide.html
const userSchema = new mongoose.Schema({
    // Account Credentials
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true
    },
    // User Role
    role: {
        type: String,
        enum: ['attendee', 'researcher', 'admin', 'null'],
        default: 'attendee'
    },
    // Personel Info
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
    loginTokenExpires: { // this is used for admin verification
        type: Date,
        default: null
    },
    isVerified: { // this enforces 2FA before allowing login
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
    // Research Info
        // Does the User have Research they will present in SOBIE.
    hasResearch: {
        type: Boolean,
        default: false
    },
    researchTitle: String,
    researchAbstract: String,
    coAuthors: [String], // Could be multiple (Array)
    sessionPreference: String, // Do you want to attend a student, faculty, or no preference?

     // --- Student/Faculty Info (from registration) ---
    isStudent: Boolean,
    studentAffiliation: String,
    studentProgram: String,
    studentClass: String,
    facultyAffiliation: String,
    facultyTitle: String,

    // --- Hotel Acknowledgment ---
    hotelAgree: {
        type: Boolean,
        default: false
    }
});

// Validation on password by comparing input to hashsed password
userSchema.methods.validatePW = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Exporting the Model: https://www.freecodecamp.org/news/module-exports-how-to-export-in-node-js-and-javascript/
module.exports = mongoose.model('UserSOBIE', userSchema);