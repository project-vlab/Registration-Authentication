// to load in environment variables
if (process.env.NODE_ENV !== "development") {
    require('dotenv').config()
}


const fs = require('fs');
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');
const methodOverride = require('method-override');
const express = require('express');
const app = express();
const initializePassport = require('./passport-config.js');
const initialize = require('./passport-config.js');



initializePassport(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    );
// to be able to read the post
app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
//app.set('view-engine', 'html');
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))
// creating a user list
const users = [];
// to store posts
const userPosts = [];

app.get("/profile", checkAuthenticated, (req, res) => {
    res,send(req.user);
})


app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});


// for logging ouot
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})


// Login portion
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login',  checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: "/login",
    failureFlash: false
}))




// registering user
app.get('/register', checkNotAuthenticated,(req, res) => {
    res.sendFile(__dirname + '/views/register.html');
});
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        // hashing the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // now adding the user
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        console.log(users);
        // once registered, redirect to login page
        res.redirect('/login');
    } catch {
        res.redirect('/register')
    }
});



// if the user is not authenticated, they will be redirected to the login page
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    // if not authenticated
    res.redirect('/login')
}
// if the user is already authenticated, we cannot allow them to go the login page
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next();
}


app.listen(5050);
