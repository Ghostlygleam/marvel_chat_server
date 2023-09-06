'use strict';

const webSocket = require('ws');

const usedPort = process.env.PORT || 9000;

const socketServer = new webSocket.Server({ port: usedPort});

socketServer.on('connection', onConnection);

console.log('SERVER START on port ${usedPort}');


class Client {
    constructor(socket, nickName, avatar) {
        this.socket = socket;
        this.nickName = nickName;
        this.avatar = avatar;
    }
};

let clientArr = [];

class Message {
    constructor(nickName, avatar, type, data) {
        this.nickName = nickName;
        this.avatar = avatar;
        this.type = type;
        this.data = data;
        this.time = Date.now();
    }
};

const maxMessagesOnServer = 100;
let messagesArr = [];

function sendingMessages(message) {
    const messageJSON = JSON.stringify(message);
    clientArr.forEach(client => client.socket.send(messageJSON));

    if(messagesArr.length === maxMessagesOnServer) messagesArr.shift();

    messagesArr.push(message);
}

function onConnection(clientSocket) {
    console.log('get new connection');

    clientSocket.on('message', function(data) {
        let message = JSON.parse(data);
        console.log('message', message);
        switch (message.type){
            case 'usedAvatars' : getUsedAvatarsRequest(clientSocket); break;
            case 'registration' : getRegistrationRequest(clientSocket, message); break;
            default : sendingMessages(message);

        };
    })

    clientSocket.on('close', function() {
        let client = clientArr.find(client => client.socket === clientSocket);

        let message = new Message(client.nickName, client.avatar, 'disconection', null);
        sendingMessages(message);

        clientArr = clientArr.filter(client => client.socket !== clientSocket);
        console.log('client disconnected');

    })

   
}

function getUsedAvatarsRequest(clientSocket) {
    let avatarArr = clientArr.map(client => client.avatar);
    let message = new Message(null, null, 'usedAvatars', avatarArr);
    clientSocket.send( JSON.stringify(message));
}
function getRegistrationRequest(clientSocket, data) {
    let isAvatarFree = true;
    let isNickNameFree = true;
    clientArr.forEach(client => {
        if(client.avatar === data.avatar) isAvatarFree = false;
        if(client.nickName === data.nickName) isNickNameFree = false;
    });
    if(!isAvatarFree){
        let message = new Message(null, null, 'avatarIsUsed', false);
        clientSocket.send(JSON.stringify(message));
        
        getUsedAvatarsRequest(clientSocket);
        return;
    }

    if(!isNickNameFree){
        let message = new Message(null, null, 'nickNameUsed', false);
        clientSocket.send(JSON.stringify(message));
        
        getUsedAvatarsRequest(clientSocket);
        return;
    }
    let connectionMessage = new Message(data.nickName, data.avatar, 'registrationSuccess', messagesArr);
    clientSocket.send( JSON.stringify(connectionMessage));

    let client = new Client(clientSocket, data.nickName, data.avatar);
    clientArr.push(client);


    let message = new Message(data.nickName, data.avatar, 'newRegictration', null);
    sendingMessages(message);
}