// jshint esversion: 6

const express = require('express');

const talkController = require('../controllers/talk');

const router = express.Router();

router.get('/talk', talkController.getTalk);

router.post('/talk', talkController.postTalk);

router.get('/talks', talkController.getTalks);

router.get('/talks/:id', talkController.getTalksId);

module.exports = router;
