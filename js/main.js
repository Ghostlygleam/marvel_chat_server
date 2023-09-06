'use strict'

/***********************
 * 
 *  COMMENT JS BLOCK
 * 
 */

const socketURL = 'ws://localhost:9000';

let socket = new WebSocket(socketURL);

socket.onopen = function () {
    console.log('socket on open');

    socket.send(JSON.stringify({ side: 'CLIENT', data: 'Hello from client'}));

    socket.onmessage = function (message) {
        console.log('GET MESSAGE:', JSON.parse(message.data));
    }
    socket.onclose = function(event) {
            console.log('connection terminated:', event);
    }
    socket.onerror = function(error) {
        console.log('connection error:', error);
    }
    
}