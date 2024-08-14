require('dotenv').config();

const express = require("express");   
const socketio = require("socket.io"); 
const http = require("http");
const { ExpressPeerServer } = require('peer');
const schedule = require('node-schedule');
const controlRooms = require("./controllers/controlRooms"); 

const twilioObj = {
    username: null,
    cred: null 
};

if (process.env.USE_TWILIO === "yes") { 
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.tokens.create().then(token => {
        twilioObj.username = token.username;
        twilioObj.cred = token.password; 
    }).catch(err => {
        console.error("Failed to create Twilio token:", err.message);
    });

    schedule.scheduleJob("0 */12 * * *", () => {
        console.log("CRON running"); 
        client.tokens.create().then(token => {
            twilioObj.username = token.username;
            twilioObj.cred = token.password; 
        }).catch(err => {
            console.error("Failed to renew Twilio token:", err.message);
        });
        controlRooms.deQRoom();
    });
}

const cors = require('cors');
const app = express(); 

const router = require("./controllers/chatController");
const server = http.createServer(app);
const io = socketio(server); 

app.use(cors());
app.use(router); 

const roomRouter = require("./routes/room");
app.use("/", roomRouter);

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});
app.use('/peerjs', peerServer);

const { 
    addUser, removeUser, getUser, getUsersInRoom,
    getUsersInVoice, addUserInVoice, removeUserInVoice 
} = require("./controllers/userController"); 

io.on('connection', socket => { 

    socket.on('join', ({name, room}, callBack) => { 
        const user = addUser({id: socket.id, name, room});  
        if (user.error) return callBack(user.error); 
        socket.join(user.room); 
        socket.emit('message', {user: 'admin', text: `Welcome ${user.name} in room ${user.room}.`});
        socket.emit('usersinvoice-before-join', {users: getUsersInVoice(user.room)});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined the room`}); 
        io.to(user.room).emit('users-online', { room: user.room, users: getUsersInRoom(user.room) });
        callBack(twilioObj);
    }); 

    socket.on('user-message', (message, callBack) => { 
        const user = getUser(socket.id); 
        io.to(user.room).emit('message', {user: user.name, text: message });
        callBack(); 
    }); 

    socket.on('join-voice', ({name, room}, callBack) => {
        io.to(room).emit('add-in-voice', {id: socket.id, name: name}); 
        addUserInVoice({id: socket.id, name, room}); 
        callBack(); 
    }); 
    socket.on('leave-voice', ({name, room}, callBack) => {
        io.to(room).emit('remove-from-voice', {id: socket.id, name: name}); 
        removeUserInVoice(socket.id); 
        callBack(); 
    }); 

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) { 
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} left the chat` });
            io.to(user.room).emit('users-online', { room: user.room, users: getUsersInRoom(user.room) });
            removeUserInVoice(user.id); 
            socket.broadcast.to(user.room).emit('remove-from-voice', {id: socket.id, name: user.name}); 
        }
    });
});

const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`); 
});
