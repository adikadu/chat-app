import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { generateMessage } from "./utils/messages";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users";

const app = express();
app.use(express.json());
app.use(express.static(`${path.resolve(path.dirname(""))}/public`));
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.status(200).sendFile("index.html");
});

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) return cb(error);

    socket.join(user.room);
    socket.emit("msg", generateMessage("robot	🤖", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("msg", generateMessage("robot	🤖", `${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on("broadcastMsg", (msg, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("newMsg", generateMessage(user.username, msg));
    cb();
  });

  socket.on("disconnect", () => {
    const { error, user } = removeUser(socket.id);
    if (error) return console.log("error", error);
    if (user) {
      io.to(user.room).emit(
        "msg",
        generateMessage("robot	🤖", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (latlong, cb) => {
    // console.log("latlong", latlong);
    // io.emit(
    //   "msg",
    //   `https://google.com/maps?q=${latlong.latitude},${latlong.longitude}`
    // );
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(
        user.username,
        `https://google.com/maps?q=${latlong.latitude},${latlong.longitude}`
      )
    );
    cb("Message delivered!");
  });
  // socket.emit("updatedCount", count);
  // socket.on("inc", () => {
  //   count++;
  //   io.emit("updatedCount", count);
  // });
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
