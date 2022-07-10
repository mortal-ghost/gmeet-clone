const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const isLoggedIn = require('../utils/middleware');

router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.redirect('/auth/google');
});

router.get('/room/new', isLoggedIn, (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

router.get('/:room', isLoggedIn, (req, res) => {
    res.render('room', { room: req.params.room });
});

module.exports = router;