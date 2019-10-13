// jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

// Mongoose Operations
mongoose.connect('mongodb://localhost:27017/ttyDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Sentiment Schema
const analysisSchema = new mongoose.Schema ({
  score: Number,
  comparative: Number,
  tokens: Array,
  positive: Array,
  negative: Array
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Talk Schema
const talkSchema = new mongoose.Schema ({
  title: String,
  content: String,
  analysis: analysisSchema
});

const Talk = mongoose.model('Talk', talkSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/talk', function(req, res) {
  res.render('talk');
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

  submittedTalk.save(function(err, talk) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.redirect('/talks');
    }
  });
});

app.get('/talks', function(req, res) {
  Talk.find({}, function(err, foundTalks) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('talks', {talks: foundTalks});
    }
  });
});

app.get('/talks/:id', function(req, res) {
  const id = req.params.id;

  Talk.findById(id, function(err, foundTalk) {
    if (err) {
      console.log(err);
    } else {
      res.render('talk-entry', {talk: foundTalk});
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
