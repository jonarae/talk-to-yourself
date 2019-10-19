// jshint esversion: 6

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Sentiment Schema
const analysisSchema = new mongoose.Schema({
  score: Number,
  comparative: Number,
  tokens: Array,
  positive: Array,
  negative: Array
});

// Talk Schema
const talkSchema = new mongoose.Schema({
  title: String,
  content: String,
  analysis: analysisSchema
});

// User talkSchema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  talks: [talkSchema]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
