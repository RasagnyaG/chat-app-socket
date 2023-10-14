"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const match_1 = require("./helpers/match");
const axios_1 = __importDefault(require("axios"));
const server = http_1.default.createServer((req, res) => { });
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const waitingQueue = []; // Queue to store waiting users
var socketRefs = {};
const addUserToQueue = (user, socket) => {
    waitingQueue.push(user);
    socketRefs[user.id] = socket;
};
// Remove the users once the connection is made
const removeUserFromQueue = (user) => {
    const index = waitingQueue.findIndex((u) => u.id === user.id);
    if (index !== -1) {
        waitingQueue.splice(index, 1);
    }
};
io.on("connect", (socket) => {
    socket.on("startChat", (token) => __awaiter(void 0, void 0, void 0, function* () {
        let user;
        try {
            let res = yield axios_1.default.get("http://localhost:3000/api/user/get-user", {
                headers: {
                    token: token,
                },
            });
            user = res.data;
            addUserToQueue(user, socket);
            console.log(waitingQueue);
            const match = (0, match_1.connectUsers)(socket, io, waitingQueue, user, socketRefs);
            console.log(match);
            if (!match)
                socket.emit("No match found");
            removeUserFromQueue(user);
            if (match)
                removeUserFromQueue(match);
        }
        catch (error) {
            console.log(error);
        }
    }));
});
server.listen(8000, () => {
    console.log("listening on port 8000....");
});
