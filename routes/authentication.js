// Imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const UserSOBIE = require('../models/userModel');
const Research = require('../models/researchModel');

`
This file is the core logic for all files.
`
// Email Transporter Setup: https://www.nodemailer.com/
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// General Navigation Routes [route below]
router.get('/', (req, res) => res.redirect('/login'));

// Auth Pages
router.get('/login', (req, res) => {
    const successMsg = req.session.successMsg;
    delete req.session.successMsg;
    res.render('login', { errorMsg: null, successMsg });
});

router.get('/signup', (req, res) => res.render('signup', { errorMsg: null }));
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        errorMsg: null,
        csrfToken: req.csrfToken()
    });
});

// Registration for Conference 

// Load the post-login registration form and requires a logged in user (req.session.userId) / pulls their data for the ejs form
router.get('/registration', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    if (!user) return res.redirect('/login');

    res.render('registration', {
        user,
        activePage: 'registration',
        csrfToken: req.csrfToken() 
    });
});


// Password Reset Form

// Verifies the rest token is valid and not expired and renders the form to allow a password update (forgot password flow)
router.get('/reset-password/:token', async (req, res) => {
    const user = await UserSOBIE.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Password reset link is invalid or expired.");

    res.render('reset-password', {
        token: req.params.token,
        csrfToken: req.csrfToken() // required for the form
    });
});

// User-Dashboard / Pagination: https://pagination.js.org/

// Loafs the user dashboard (shows user info, list paginated research submissions, shows success messages [after login or verification])
router.get('/user-dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalSubmissions = await Research.countDocuments({ userId: user._id });
    const totalPages = Math.ceil(totalSubmissions / limit);

    const submissions = await Research.find({ userId: user._id })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit);

    const successMsg = req.session.successMsg;
    delete req.session.successMsg; // clear after displaying

    res.render('user-dashboard', {
        user,
        submissions,
        currentPage: page,
        totalPages,
        successMsg,
        activePage: 'dashboard',
        csrfToken: req.csrfToken()
    });
});

// User Research CSV Export: https://www.npmjs.com/package/csv-writer

// Downloads the user's research submissions via CSV, and its used by the researchers on the dashboard.
router.get('/user-dashboard/export', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    const submissions = await Research.find({ userId: req.session.userId });

    if (!submissions.length) return res.send("No submissions to export.");

    const csvWriter = createCsvWriter({
        path: 'user_research_export.csv',
        header: [
            { id: 'title', title: 'Title' },
            { id: 'abstract', title: 'Abstract' },
            { id: 'coAuthors', title: 'Co-Authors' },
            { id: 'session', title: 'Session' },
            { id: 'submittedAt', title: 'Submitted At' }
        ]
    });

    const records = submissions.map(r => ({
        title: r.title,
        abstract: r.abstract,
        coAuthors: r.coAuthors.join(', '),
        session: r.session,
        submittedAt: r.submittedAt.toLocaleDateString()
    }));

    await csvWriter.writeRecords(records);
    res.download('user_research_export.csv');
});

// Admin Dashboard (GET)

// Shows all users with pagination: https://pagination.js.org/
router.get('/admin-dashboard', async (req, res) => {
    if (!req.session.tempAdmin) return res.redirect('/login');
    delete req.session.tempAdmin; // admin must verify each time;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalUsers = await UserSOBIE.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await UserSOBIE.find()
        .skip((page - 1) * limit)
        .limit(limit);

    res.render('admin-dashboard', { users, totalPages, currentPage: page });
});

// Admin Dashboard (CSV Export): https://www.npmjs.com/package/csv-writer

// CSV export of all user and research data: 
router.get('/admin-dashboard/export', async (req, res) => {
    const users = await UserSOBIE.find();

    const csvWriter = createCsvWriter({
        path: 'sobie_users_export.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'role', title: 'Role' },
            { id: 'session', title: 'Session Preference' },
            { id: 'title', title: 'Research Title' },
            { id: 'coAuthors', title: 'Co-Authors' }
        ]
    });

    const records = users.map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        session: u.sessionPreference || 'None',
        title: u.hasResearch ? u.researchTitle : '—',
        coAuthors: u.hasResearch ? u.coAuthors.join(', ') : 'None'
    }));

    await csvWriter.writeRecords(records);
    res.download('sobie_users_export.csv');
});

// Admin resend verification email
router.post('/resend-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.render('login', { errorMsg: "Email is required to resend verification." });
    }

    const user = await UserSOBIE.findOne({ email });

    if (!user || !user.tokenVerify) {
        return res.render('login', { errorMsg: "No verification token found for this user." });
    }

    const link = `${process.env.HOST_IP}/verify-login?token=${user.tokenVerify}`;
    await transporter.sendMail({
        to: email,
        subject: "SOBIE Admin Login Verification",
        text: `Click the link to verify your login:\n\n${link}`
    });

    res.render('verify', {
        errorMsg: "A new verification email has been sent.",
        csrfToken: req.csrfToken(),
        email
    });
    
});

// Profile Page (Progress)

// Loads profile info 
// router.get('/profile', async (req, res) => {
//     if (!req.session.userId) return res.redirect('/login');
//     const user = await UserSOBIE.findById(req.session.userId);
//     res.render('profile', { user });
// });

// Submit Research (view)
router.get('/submit-research', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    res.render('submit-research', { user, success: false });
});
// Submit Research (inserts a new research submission document)
router.post('/submit-research', async (req, res) => {
    const { researchTitle, researchAbstract, sessionPreference, coAuthorsRawInput } = req.body;
    const coAuthors = coAuthorsRawInput ? coAuthorsRawInput.split(',').map(n => n.trim()).filter(Boolean) : [];

    try {
        await Research.create({
            userId: req.session.userId,
            title: researchTitle,
            abstract: researchAbstract,
            session: sessionPreference,
            coAuthors
        });

        await UserSOBIE.findByIdAndUpdate(req.session.userId, {
            hasResearch: true
        });

        const user = await UserSOBIE.findById(req.session.userId);
        res.render('submit-research', { user, success: true });
    } catch (err) {
        res.status(500).send("Submission failed.");
    }
});

// Signup

// Creates the user and sends a verification email and does not insert user until /finalize-signup step (correct)
router.post('/signup', async (req, res) => {
    const {
        firstName, lastName, email, username, password, confirmPassword
    } = req.body;

    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
        return res.render('signup', {
            errorMsg: "Password must include at least 8 characters, one uppercase letter, one number, and one special character."
        });
    }

    if (password !== confirmPassword) {
        return res.render('signup', { errorMsg: "Passwords do not match." });
    }

    const existingEmail = await UserSOBIE.findOne({ email });
    const existingUsername = await UserSOBIE.findOne({ username });
    if (existingEmail || existingUsername) {
        return res.render('signup', { errorMsg: "Account already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tokenVerify = crypto.randomBytes(20).toString('hex');

    const newUser = await UserSOBIE.create({
        firstName,
        lastName,
        email,
        username,
        passwordHash,
        tokenVerify,
        isVerified: false
    });

    const link = `${process.env.HOST_IP}/verify?token=${tokenVerify}`;
    await transporter.sendMail({
        to: email,
        subject: "SOBIE Email Verification",
        html: `
          <h3>Welcome to SOBIE!</h3>
          <p>Click the link below to verify your email address:</p>
          <p><a href="${link}" target="_blank" style="color:#0d6efd;">Verify Your Email</a></p>
          <p>If the link doesn't work, copy and paste this into your browser:</p>
          <p>${link}</p>
        `
    });

    res.redirect('/verify');
});


// Login

// Handles the regular and admin login, 
// on login page you have to use a secret password that is stored in .env file [UNA] to get access to admin dashboard)
// steps: 1 go to login page, step 2 enter whatever email you want for 2FA, step 3 enter UNA as password (the admin user is never stored in DB)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const isAdminLogin = password === process.env.ADMIN_SECRET_PASSWORD;

    if (isAdminLogin) {
        const user = await UserSOBIE.findOne({ email });
        if (!user) return res.send("No admin account found with this email.");
    
        const verifyToken = crypto.randomBytes(20).toString('hex');
        user.tokenVerify = verifyToken;
        user.loginTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
    
        const link = `${process.env.HOST_IP}/verify-login?token=${verifyToken}`;
        await transporter.sendMail({
            to: email,
            subject: "SOBIE Admin Login Verification",
            text: `Click the link to verify admin login:\n\n${link}`
        });
    
        req.session.adminLogin = {
            email,
            tokenVerify: verifyToken
        };
    
        return res.redirect('/verify');
    }
    
    // --- Regular User Flow ---
    const user = await UserSOBIE.findOne({ email });
    if (!user || !user.isVerified) {
        return res.render('login', { errorMsg: "Invalid login or unverified account." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        return res.render('login', { errorMsg: "Incorrect password." });
    }

    // Generate 2FA token and send
    const verifyToken = crypto.randomBytes(20).toString('hex');
    user.tokenVerify = verifyToken;
    user.loginTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const link = `${process.env.HOST_IP}/verify-login?token=${verifyToken}`;
    await transporter.sendMail({
        to: email,
        subject: "SOBIE Login Verification",
        text: `Click the link to complete your login:\n\n${link}`
    });

    req.session.userLogin = {
        email,
        tokenVerify: verifyToken
    };

    res.redirect('/verify');
});

// Verify Section

// Gets the verification token from email, finalizes signup in next POST Route
router.get('/verify', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.render('verify', {
            errorMsg: "Missing or invalid token. Please check your email for the verification link.",
            csrfToken: req.csrfToken(),
            email: req.session?.userLogin?.email || req.session?.adminLogin?.email || ''
        });
    }

    const user = await UserSOBIE.findOne({ tokenVerify: token, isVerified: false });

    if (!user) {
        return res.render('verify', {
            errorMsg: "Invalid or expired verification link.",
            csrfToken: req.csrfToken(),
            email: req.session?.userLogin?.email || req.session?.adminLogin?.email || ''
        });
    }

    req.session.verifiedUserId = user._id;
    res.render('final-verify', {
        verified: true,
        csrfToken: req.csrfToken() 
    });
});


// Finalize Signup
router.post('/finalize-signup', async (req, res) => {
    const userId = req.session.verifiedUserId;
    if (!userId) return res.send("Verification session expired.");

    const user = await UserSOBIE.findById(userId);
    if (!user || user.isVerified) {
        return res.send("Invalid or already verified.");
    }

    user.isVerified = true;
    user.tokenVerify = null;
    await user.save();

    delete req.session.verifiedUserId;
    req.session.userId = user._id;

    res.redirect('/user-dashboard');
});


// Verify Login Token Section (verifies admin email login token / Admin login 2FA)
router.get('/verify-login', async (req, res) => {
    const { token } = req.query;

    // Admin login
    if (req.session.adminLogin && req.session.adminLogin.tokenVerify === token) {
        req.session.tempAdmin = true;
        delete req.session.adminLogin;
        return res.redirect('/admin-dashboard'); // ADD return here
    }

    // Regular user login
    const user = await UserSOBIE.findOne({
        tokenVerify: token,
        loginTokenExpires: { $gt: Date.now() }
      });
      
    if (!user) return res.send("Invalid or expired login link.");
      
    user.tokenVerify = null;
    user.loginTokenExpires = null;
    await user.save();
    req.session.userId = user._id;
    res.redirect('/user-dashboard');
      
});


// Forgot Password (handles pw reset email)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await UserSOBIE.findOne({ email });
    if (!user) return res.send("No account found.");

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
    await transporter.sendMail({
        to: email,
        subject: 'SOBIE Password Reset',
        text: `Click the link to reset your password:\n\n${resetLink}`
    });

    res.send("Reset email sent.");
});

// Reset Password Section (handles reset form logic)
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) return res.send("Passwords do not match.");

    const user = await UserSOBIE.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Invalid or expired token.");

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.session.successMsg = "Password successfully updated. You may now log in.";
    res.redirect('/login');
});

// Updates PW from Dashbaord (allows loggin-in users to change their pw securely)
router.post('/update-password', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
        req.session.successMsg = "Passwords do not match.";
        return res.redirect('/user-dashboard');
    }

    const user = await UserSOBIE.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
        req.session.successMsg = "Current password is incorrect.";
        return res.redirect('/user-dashboard');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.session.successMsg = "Password successfully updated.";
    res.redirect('/user-dashboard');
});


// User Registration Form (Profile), saves the post-sign ip registration fields
router.post('/registration', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const {
        role,
        isStudent,
        studentAffiliation,
        studentProgram,
        studentClass,
        facultyAffiliation,
        facultyTitle,
        researchTitle,
        researchAbstract,
        coAuthorsRawInput,
        sessionPreference,
        hotelAgree
    } = req.body;

    const user = await UserSOBIE.findById(req.session.userId);
    if (!user) return res.send("User not found");

    // Update registration info
    user.role = role;
    user.hotelAgree = hotelAgree === 'on';

    // Research (only if researcher)
    if (role === 'researcher') {
        user.hasResearch = !!researchTitle;
        user.researchTitle = researchTitle;
        user.researchAbstract = researchAbstract;
        user.sessionPreference = sessionPreference;
        user.coAuthors = coAuthorsRawInput
            ? coAuthorsRawInput.split(',').map(name => name.trim()).filter(Boolean)
            : [];
    } else {
        user.hasResearch = false;
        user.researchTitle = '';
        user.researchAbstract = '';
        user.sessionPreference = '';
        user.coAuthors = [];
    }

    // Student/Faculty
    user.isStudent = isStudent === 'yes';
    user.studentAffiliation = user.isStudent ? studentAffiliation : '';
    user.studentProgram = user.isStudent ? studentProgram : '';
    user.studentClass = user.isStudent ? studentClass : '';
    user.facultyAffiliation = user.isStudent ? '' : facultyAffiliation;
    user.facultyTitle = user.isStudent ? '' : facultyTitle;

    if (role === 'researcher' && researchTitle) {
        const existingSubmission = await Research.findOne({
            userId: user._id,
            title: researchTitle
        });

        if (!existingSubmission) {
            await Research.create({
                userId: user._id,
                title: researchTitle,
                abstract: researchAbstract,
                session: sessionPreference,
                coAuthors: coAuthorsRawInput
                    ? coAuthorsRawInput.split(',').map(n => n.trim()).filter(Boolean)
                    : []
            });
        }
    }

    await user.save();


    // Send confirmation email
    const mapLink = 'https://www.google.com/maps?q=Sandestin+Golf+and+Beach+Resort';
    await transporter.sendMail({
        to: user.email,
        subject: "SOBIE Conference Registration Confirmation",
        text: `
Dear ${user.firstName},

Thank you for registering for the SOBIE Conference.

🗓 Conference Dates: April 1–3, 2025  
📍 Location: Sandestin Golf & Beach Resort  
📞 Hotel Booking: 800-320-8115 (Use group code: SOBIE)  
📍 Map: ${mapLink}

Remember: hotel accommodations must be arranged separately. We look forward to seeing you at SOBIE!

Sincerely,  
SOBIE Conference Team
    `
    });

    // Success feedback
    req.session.successMsg = "Conference registration submitted successfully!";
    res.redirect('/user-dashboard');
});

// Logout Section (clears the session and redirected back to login)
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.send("Error logging out.");
        }
        res.redirect('/login');
    });
});

module.exports = router;  