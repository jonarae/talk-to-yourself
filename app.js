// jshint esversion: 6

require("dotenv").config();
const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy;
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

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

// Mongoose Operations
mongoose.connect('mongodb://localhost:27017/ttyDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sentiment Schema
const analysisSchema = new mongoose.Schema({
  score: Number,
  comparative: Number,
  tokens: Array,
  positive: Array,
  negative: Array
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Talk Schema
const talkSchema = new mongoose.Schema({
  title: String,
  content: String,
  analysis: analysisSchema
});

const Talk = mongoose.model('Talk', talkSchema);

// User talkSchema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  talks: [talkSchema]
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/talk', function(req, res) {
  res.render('talk', {
    isLoggedIn: req.isAuthenticated()
  });
});

app.post('/talk', function(req, res) {
  const title = req.body.title;
  const content = req.body.content;
  const analysis = sentiment.analyze(content);

  const submittedTalk = new Talk({
    title: title,
    content: content,
    analysis: new Analysis(analysis)
  });

  if (req.isAuthenticated()) {
    User.findByIdAndUpdate(req.user.id, {
      $push: {
        talks: {
          $each: [submittedTalk],
          $sort: {
            _id: -1
          }
        }
      }
    }, function(err, foundUser) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        res.redirect('/talks');
      }
    });
  } else {

    if (req.body.button === 'login') {

      const user = new User({
        username: req.body.username,
        password: req.body.password
      });

      req.login(user, function(err) {
        passport.authenticate('local')(req, res, function() {

          User.findByIdAndUpdate(req.user.id, {
            $push: {
              talks: {
                $each: [submittedTalk],
                $sort: {
                  _id: -1
                }
              }
            }
          }, function(err, foundUser) {
            if (err) {
              console.log(err);
              res.redirect('/');
            } else {
              res.redirect('/talks');
            }
          });


        });
      });

    } else {
      User.register(new User({
        username: req.body.username,
        talks: [submittedTalk]
      }), req.body.password, function(err, user) {
        if (err) {
          console.log(err);
          res.redirect('/');
        } else {
          passport.authenticate('local')(req, res, function() {
            res.redirect('/talks');
          });
        }
      });
    }
  }
});

app.get('/talks', function(req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        res.render('talks', {
          talks: foundUser.talks
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get('/talks/:id', function(req, res) {
  const talkId = req.params.id;

  if (req.isAuthenticated()) {

    User.findById(req.user.id, {
      talks: {
        $elemMatch: {
          _id: talkId
        }
      }
    }, function(err, foundUser) {

      if (err || foundUser.talks.length === 0) {
        console.log(err);
        res.redirect('/');
      } else {

        // length is always 1
        foundUser.talks.forEach(function(foundTalk) {
          const negativeWords = foundTalk.analysis.negative;
          const negativeRegex = new RegExp(negativeWords.join('|'), 'gi');

          let content = foundTalk.content;
          content = content.replace(negativeRegex, function(word) {
            return `<mark>${word}</mark>`;
          });

          res.render('talk-entry', {
            title: foundTalk.title,
            content: content
          });
        });
      }
    });

  } else {
    res.redirect("/");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
