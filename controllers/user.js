// jshint esversion: 6

const passport = require('passport');

const User = require('../models/user');

exports.signup = (req, res) => {

  User.register(new User({
    username: req.body.username
  }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  });

};

exports.login = (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    passport.authenticate('local')(req, res, function() {
      res.redirect('/');
    });
  });

};

exports.logout = (req, res) => {

  req.logout();
  res.redirect('/');

};
