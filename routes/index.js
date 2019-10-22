// jshint esversion: 6

const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

module.exports = router;
