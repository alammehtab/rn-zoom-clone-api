const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

let users = [];
const port = 3001;

const addUser = (userName, roomId) => {
  users.push({
    userName: userName,
    roomId: roomId,
  });
};

const userLeave = (userName) => {
  users = users.filter((user) => user.userName != userName);
};

const getRoomUsers = (roomId) => {
  return users.filter((user) => user.roomId == roomId);
};

app.get("/", (req, res) => {
  res.send("Welcome to NodeJS and ExpressJS");
});

io.on("connection", (socket) => {
  console.log("someone connected");
  socket.on("join-room", ({ roomId, userName }) => {
    console.log("user joined room");
    console.log(userName);
    console.log(roomId);
    if (roomId && userName) {
      socket.join(roomId);
      addUser(userName, roomId);
      socket.to(roomId).emit("user-connected ", userName);
      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    }

    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.leave(roomId);
      userLeave(userName);
      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    });
  });
});

server.listen(port, () => {
  console.log("Zoom clone API listening on localhost:3001");
});
