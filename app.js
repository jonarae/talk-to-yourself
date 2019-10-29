// jshint esversion: 6

require("dotenv").config();
const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

// Connect to database
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(result => {
    app.listen(process.env.PORT, function() {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  });

const User = require('./models/user');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
  const isLoggedIn = req.isAuthenticated();
  res.render('home', {isLoggedIn: isLoggedIn});
});

const talkRoutes = require('./routes/talk');
const indexRoutes = require('./routes/index');

app.use(talkRoutes);
app.use(indexRoutes);
