const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://weholdahand.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.on("create_chatroom", (data) => {
    socket.join(data);
    console.log(`user: ${socket.id} joined chatroom: ${data}`);
    socket.emit("chatroom_created");
  });

  socket.on("send_message", (data) => {
    console.log(data);
    socket.join(data.roomId);
    io.to(data.roomId).emit("message_sent", data);
  });
});

module.exports = { app, io, server };
