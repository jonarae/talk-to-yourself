// jshint esversion: 6

const passport = require('passport');
const Sentiment = require('sentiment');

const User = require('../models/user');

exports.signup = (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  const newUserInfo = {
    username: req.body.username
  };

  if (title && content) {
    const sentiment = new Sentiment();
    const analysis = sentiment.analyze(content);

    const submittedTalk = {
      title: title,
      content: content,
      analysis: analysis
    };
    newUserInfo.talks = [submittedTalk];
  }

  const newUser = new User(newUserInfo);

  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      passport.authenticate('local')(req, res, function() {
        if (newUserInfo.talks) {
          res.redirect('/talks');
        }
        else {
          res.redirect('/');
        }
      });
    }
  });

};

exports.login = (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    passport.authenticate('local')(req, res, function() {

      if (title && content) {
        const sentiment = new Sentiment();
        const analysis = sentiment.analyze(content);

        const submittedTalk = {
          title: title,
          content: content,
          analysis: analysis
        };

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
      }
      else {
        res.redirect('/');
      }
    });
  });

};

exports.logout = (req, res) => {

  req.logout();
  res.redirect('/');

};
