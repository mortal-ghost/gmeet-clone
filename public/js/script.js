const socket = io('/');
const myPeer = new Peer(user, {
    host: '/',
    port: '3001',
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

let myVideoStream;
let userId;
const peers = {};
let isVideoEnabled = true;
let isAudioEnabled = true;

myPeer.on('open', (id) => {
    userId = id;
    socket.emit('join-room', ROOM_ID, id);
});

navigator.mediaDevices.getUserMedia({
    video: isVideoEnabled,
    audio: isAudioEnabled,
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', (userId) => {
    peers[userId].close();
});

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.appendChild(video);
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove();
        videoGrid.removeChild(video);
    });

    call.on('error', (err) => {
        console.log(err);
        alert(err,  '\nKindly try again');
    });

    peers[userId] = call;
}

const muteUnmute = document.querySelector('#main-mute-btn');
const videoBtn = document.querySelector('#main-video-btn');
const leaveRoom = document.querySelector('#main-leave-btn');

muteUnmute.addEventListener('click', toggleMute);
videoBtn.addEventListener('click', toggleVideo);


function toggleMute() {
    isAudioEnabled = !isAudioEnabled;
    myVideoStream.getAudioTracks()[0].enabled = isAudioEnabled;

    if (isAudioEnabled) {
        muteUnmute.innerHTML = "<i class='fas fa-microphone-alt'></i>";
    } else {
        muteUnmute.innerHTML = "<i class='fas fa-microphone-slash'></i>";
    }
}

function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    myVideoStream.getVideoTracks()[0].enabled = isVideoEnabled;

    if (isVideoEnabled) {
        videoBtn.innerHTML = "<i class='fas fa-video'></i>";
    } else {
        videoBtn.innerHTML = "<i class='fas fa-video-slash'></i>";
    }
}