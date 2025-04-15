// Imports
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const authentication = require('./routes/authentication');
const app = express();
require('dotenv').config();


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true }));
app.use(express.static('public'));

// This sets up the user session handling
app.use(session({ 
    secret: process.env.SESSION_SECRET, // encryption on session cookies (session ID)
    resave: false, // saves session when something is changed
    saveUninitialized: false // does not create session data until something it stored (userID)
}));

// MongoDB Connection: https://mongoosejs.com/docs/connections.html#error-handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.log.error("MongoDB Connection Failure:", err));

` Thought about using native MongoDB driver but extra work, plus mongoose I can build my own schemas.
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri); // create connection
const mongoCollection = client.db("game-app-database").collection("game-app-list");
mongoCollection.insertOne({ title: "example" });
`

app.use('/', authentication); // all routes under '/'
<<<<<<< HEAD
app.listen(3000, () => console.log('Server is running on ... http://localhost:3000')); // start server
=======
app.listen(3000, () => console.log('Server is running on ... http://localhost:3000')); // start server
>>>>>>> 6ce0a87 (back-end finished need to work on views)
