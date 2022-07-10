const express = require('express');
const passport = require('passport');
const http = require('http');
const session = require('express-session');
const app = express();
const meetRoutes = require('./routes/meet');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

require('./utils/passport');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(meetRoutes);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}));

io.on('connection', (socket) => {
    socket.on('join-room', (room, userId) => {
        socket.join(room);

        socket.to(room).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(room).emit('user-disconnected', userId);
        });
    });
})

server.listen(4000, () => {
    console.log('Server listening on port 4000');
});