// ===== REQUIRED MODULES =====
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const UserSOBIE = require('../models/userModel');
const Research = require('../models/researchModel');

// ===== EMAIL SETUP =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== REDIRECT ROOT =====
router.get('/', (req, res) => res.redirect('/login'));

// ===== AUTH PAGES =====
router.get('/login', (req, res) => res.render('login'));
router.get('/signup', (req, res) => res.render('signup'));
router.get('/forgot-password', (req, res) => res.render('forgot-password'));


// ===== CONFERENCE REGISTRATION PAGE =====
router.get('/registration', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    if (!user) return res.redirect('/login');
    res.render('registration', { user, activePage: 'registration' });
});

// ===== PASSWORD RESET FORM =====
router.get('/reset-password/:token', async (req, res) => {
    const user = await UserSOBIE.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Password reset link is invalid or expired.");
    res.render('reset-password', { token: req.params.token });
});

// ===== USER DASHBOARD W/ PAGINATION =====
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
        activePage: 'dashboard' // Add this if using active nav highlighting
    });
});

// ===== USER EXPORT CSV =====
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

// ===== ADMIN DASHBOARD =====
router.get('/admin-dashboard', async (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/login');

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalUsers = await UserSOBIE.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await UserSOBIE.find()
        .skip((page - 1) * limit)
        .limit(limit);

    res.render('admin-dashboard', { users, totalPages, currentPage: page });
});

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

// ===== PROFILE VIEW =====
router.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    res.render('profile', { user });
});

// ===== SUBMIT RESEARCH (VIEW + POST) =====
router.get('/submit-research', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await UserSOBIE.findById(req.session.userId);
    res.render('submit-research', { user, success: false });
});

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

// ===== SIGNUP =====
// ===== SIGNUP =====
router.post('/signup', async (req, res) => {
    const {
        firstName, lastName, email, username, password, confirmPassword
    } = req.body;

    if (password !== confirmPassword) {
        return res.render('signup', { errorMsg: "Passwords do not match." });
    }

    const existingEmail = await UserSOBIE.findOne({ email });
    const existingUsername = await UserSOBIE.findOne({ username });
    if (existingEmail || existingUsername) {
        return res.send("Account already exists.");
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
        isVerified: false,
        // role will be assigned later on /registration
    });

    const link = `${process.env.HOST_IP}/verify?token=${tokenVerify}`;
    await transporter.sendMail({
        to: email,
        subject: "SOBIE Email Verification",
        text: `Click this link to verify your account:\n\n${link}`
    });

    res.redirect('/verify');
});


// ===== LOGIN =====
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const isAdminLogin = password === process.env.ADMIN_SECRET_PASSWORD;

    if (isAdminLogin) {
        const tokenVerify = crypto.randomBytes(20).toString('hex');
        req.session.adminLogin = { email, tokenVerify };

        const link = `${process.env.HOST_IP}/verify-login?token=${tokenVerify}`;
        await transporter.sendMail({
            to: email,
            subject: "SOBIE Admin Login Verification",
            text: `Click the link to verify admin login:\n\n${link}`
        });

        return res.redirect('/verify');
    }

    const user = await UserSOBIE.findOne({ email });
    if (!user) return res.send("Invalid Email or Password");

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.send("Invalid Email or Password");

    const verifyToken = crypto.randomBytes(20).toString('hex');
    user.tokenVerify = verifyToken;
    await user.save();

    const link = `${process.env.HOST_IP}/verify-login?token=${verifyToken}`;
    await transporter.sendMail({
        to: email,
        subject: "SOBIE Login Verification",
        text: `Click the link to verify your login:\n\n${link}`
    });

    req.session.tempUserId = user.email;
    res.redirect('/verify');
});

// ===== VERIFY GET & FINALIZE =====
router.get('/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.render('verify');

    const user = await UserSOBIE.findOne({ tokenVerify: token });
    if (!user) return res.send("Invalid or expired verification link.");
    if (user.isVerified) return res.send("User already verified. Please log in.");

    req.session.verifiedUserId = user._id;
    res.render('final-verify', { verified: true });
});

router.post('/finalize-signup', async (req, res) => {
    const userId = req.session.verifiedUserId;
    if (!userId) return res.send("Session expired.");

    const user = await UserSOBIE.findById(userId);
    if (!user || user.isVerified) return res.send("Invalid or already verified.");

    user.isVerified = true;
    user.tokenVerify = null;
    await user.save();

    delete req.session.verifiedUserId;
    req.session.userId = user._id;

    res.redirect(user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
});

// ===== VERIFY LOGIN TOKEN =====
router.get('/verify-login', async (req, res) => {
    const { token } = req.query;

    // 🔒 Admin login
    if (req.session.adminLogin && req.session.adminLogin.tokenVerify === token) {
        req.session.isAdmin = true;
        delete req.session.adminLogin;
        return res.redirect('/admin-dashboard');
    }

    // 🔒 Regular user login
    const user = await UserSOBIE.findOne({ tokenVerify: token });
    if (!user) return res.send("Invalid or expired login link.");

    user.tokenVerify = null;
    await user.save();

    req.session.userId = user._id;
    res.redirect('/user-dashboard');
});


// ===== PASSWORD RESET FLOW =====
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

    res.send("Password successfully updated. You may now log in.");
});

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


// Profile
router.post('/profile', async (req, res) => {
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

// ===== LOGOUT =====
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