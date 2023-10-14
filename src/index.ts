import { Server, Socket } from "socket.io";
import http from "http";
import User from "./models/user";
import { connectUsers } from "./helpers/match";
import axios from "axios";
const server = http.createServer((req: any, res: any) => {});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const waitingQueue: User[] = []; // Queue to store waiting users
var socketRefs: any = {};

const addUserToQueue = (user: User, socket: Socket) => {
  waitingQueue.push(user);
  socketRefs[user.id] = socket;
};

// Remove the users once the connection is made
const removeUserFromQueue = (user: User) => {
  const index = waitingQueue.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
};

io.on("connect", (socket) => {
  socket.on("startChat", async (token) => {
    let user: User;
    try {
      let res = await axios.get("http://localhost:3000/api/user/get-user", {
        headers: {
          token: token,
        },
      });

      user = res.data;
      addUserToQueue(user, socket);
      console.log(waitingQueue);
      const match = connectUsers(socket, io, waitingQueue, user, socketRefs);
      console.log(match);
      if (!match) socket.emit("error", "No match found");
      removeUserFromQueue(user);
      if (match) removeUserFromQueue(match);
    } catch (error) {
      console.log(error);
    }
  });
});

server.listen(8000, () => {
  console.log("listening on port 8000....");
});