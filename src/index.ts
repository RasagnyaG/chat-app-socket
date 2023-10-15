import { Server, Socket } from "socket.io";
import http from "http";
import User from "./models/user";
import { connectUsers } from "./helpers/match";
import axios from "axios";
import { onMessage } from "./helpers/chatRoom";
import dotenv from "dotenv";
dotenv.config();

const server = http.createServer((req: any, res: any) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Hello world");
  }
});

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
    console.log("start chat");
    let user: User;

    try {
      let res = await axios.get(process.env.API_BASE_URL + "/user/get-user", {
        headers: {
          token: token,
        },
      });

      user = res.data;
      addUserToQueue(user, socket);
      const match = await connectUsers(
        socket,
        io,
        waitingQueue,
        user,
        socketRefs
      );
      console.log("match");
      console.log(match);

      if (match === null && waitingQueue.includes(user))
        socket.emit("error", "No match found");
      if (match === null) console.log("emitted");

      removeUserFromQueue(user);
      if (match) removeUserFromQueue(match);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("message", (message) => {
    console.log(message);
    onMessage(io, socket, message);
  });
});

server.listen(8000, () => {
  console.log("listening on port 8000....");
});
