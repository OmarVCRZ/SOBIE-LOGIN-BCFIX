// Load environment variables from .env
require('dotenv').config();
// Imports
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authentication = require('./routes/authentication');
const path = require('path');
const csurf = require('csurf');

`
The purpose of this page is that it is the main server file, initializing the Express Server, 
connecting to MongoFB, manages the sessions, and loads authentication.js/
`
// Initialize APP
const app = express();
// View Engine
app.set('view engine', 'ejs');
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// This sets up the user session handling
app.use(session({
    secret: process.env.SESSION_SECRET, // encryption on session cookies (session ID)
    resave: false, // saves session when something is changed
    saveUninitialized: false // does not create session data until something it stored (userID)
}));
// Fix for CSRF to work only when session exists
app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }
    if (!req.session) {
        return res.status(403).send("Session not initialized.");
    }
    next();
});

app.use(csurf());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Handle CSRF errors
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next();
    res.status(403).send('Form tampered with or session expired (CSRF protection).');
});


// MongoDB Connection: https://mongoosejs.com/docs/connections.html#error-handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.error("MongoDB Connection Failure:", err));

` Thought about using native MongoDB driver but extra work, plus mongoose I can build my own schemas.
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri); // create connection
const mongoCollection = client.db("game-app-database").collection("game-app-list");
mongoCollection.insertOne({ title: "example" });
`
// Redirects to Login
app.get('/', (req, res) => {
    res.redirect('/login')
});

// Load the main router (all pages and POST routes)
app.use('/', authentication);
// Starts the server
app.listen(3000, () => console.log('Server is running on ... http://localhost:3000'));