const path = require("path");
const express = require("express");
const http = require("http");
const moment = require("moment"); //for time
const socketio = require("socket.io");
const PORT = process.env.PORT || 5050;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

let rooms = []; //array containing the room id
let Rooms = {}; //obj mapping roomid with username and usercount
// let usercount = 0;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

//A user connects
io.on("connection", (socket) => {
  console.log("A user connected");

  // when the user clicks on "create room" button in index.js a roomid is created and passed. Then the roomid is added into an array called rooms and an object called Rooms.
  // why 2 rooom? ans= the array rooms is used for checking wheater the room exists and it will be complicated to call the obj recuurently for suh a trivial task. Rooms is mostly used for the server side. room(array) is passed to index.html so that when a user tries to join a room it can check wheater the room exists or not.
  socket.on("addroom", (room_id) => {
    console.log(`added room ${room_id} to the array`);
    rooms.push(room_id); //adding the room to the array
    Rooms[room_id] = { users: {}, userCount: 0, toss: {} }; // Initialize room with empty users array and user count 0
  });

  //For sending the rooms(array) to "index" file
  socket.on("roomlist", () => {
    console.log(`Sending back the list of rooms`);
    socket.emit("roomlist", rooms);
  });

  //when a user joins a room
  socket.on("joinroom", (room_id, username) => {
    if (!Rooms[room_id]) {
      console.log(`Room ${room_id} does not exist`);
      return;
    } //checking if the room exists in the Rooms object

    //if the usercount in that particular room is more than 2 then you cannot join
    if (!(Rooms[room_id].userCount < 2)) {
      console.log("number of user exceeded");
      socket.emit("alert", "Room is full");
      return;
    }
    //if the usercount is lessthan 2 you can join
    else {
      socket.join(room_id);
      Rooms[room_id].userCount++;
      Rooms[room_id].users[socket.id] = username;
      console.log(`${username} joined in ${room_id}`);
      console.log(`users in ${room_id} are ${JSON.stringify(Rooms[room_id])}`);
    }
    //when the number of users hit 2 the game starts this if condition is used for that purpose.
    if (Rooms[room_id].userCount === 2) {
      io.to(room_id).emit("start match"); //changed from socket to io bcoz it will not emit to the 2nd user who
      console.log("Number of users is 2 so everyone can start playing");
    }
  });

  // let randomValue = Math.round(Math.random());
  //after a user sends their toss (heads or tails) value it is sended there for
  socket.on("my_heads_or_tails_choice", (heads_or_tails, room_id) => {
    console.log(`${Rooms[room_id].users[socket.id]} chose ${heads_or_tails}`);
    Rooms[room_id].toss[socket.id] = heads_or_tails; //saving what the user chose inside the Rooms obj
    console.log(Rooms[room_id].toss);
    socket.to(room_id).emit("opponents_heads_or_tails_choice", heads_or_tails); //broadcasting what the opponent chose
    // heads=0,tails=1
    if (Object.keys(Rooms[room_id].toss).length === 2) {
      console.log("both plyers have made their my_heads_or_tails_choice");
      let randomValue = Math.round(Math.random());
      console.log(`random value generated is ${randomValue}`);
      if (randomValue === 1) {
        for (const [socketid, choice] of Object.entries(Rooms[room_id].toss)) {
          if (choice === "tails") {
            console.log(`${socketid} has won the toss`);
            socket.to(socketid).emit("toss result", "won", "tails");
          } else {
            console.log(`${socketid} lose the toss`);
            socket.to(socketid).emit("toss result", "lose", "tails");
          }
        }
      } else {
        for (const [socketid, choice] of Object.entries(Rooms[room_id].toss)) {
          if (choice === "heads") {
            console.log(`${socketid} has won the toss`);
            socket.to(socketid).emit("toss result", "won", "heads");
          } else {
            console.log(`${socketid} lose the toss`);
            socket.to(socketid).emit("toss result", "lose", "heads");
          }
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} aka disconnected`);
  });
});
server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);
