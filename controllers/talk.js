// jshint esversion: 6

const passport = require('passport');
const Sentiment = require('sentiment');

const User = require('../models/user');

exports.getTalk = (req, res) => {
  res.render('talk', {
    isLoggedIn: req.isAuthenticated()
  });
};

exports.postTalk = (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  const sentiment = new Sentiment();
  const analysis = sentiment.analyze(content);

  const submittedTalk = {
    title: title,
    content: content,
    analysis: analysis
  };

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
};

exports.getTalks = (req, res) => {
  const isLoggedIn = req.isAuthenticated();

  if (isLoggedIn) {
    User.findById(req.user.id, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        res.render('talks', {
          talks: foundUser.talks,
          isLoggedIn: isLoggedIn
        });
      }
    });
  } else {
    res.redirect("/");
  }
};

exports.getTalksId = (req, res) => {
  const talkId = req.params.id;
  const isLoggedIn = req.isAuthenticated();

  if (isLoggedIn) {

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
            isLoggedIn: isLoggedIn,
            title: foundTalk.title,
            content: content
          });
        });
      }
    });

  } else {
    res.redirect("/");
  }
};
