import { Server, Socket } from "socket.io";

export const onMessage = (io: Server, socket: Socket, message: any) => {
  const connectedSockets = io.sockets.sockets;

  // list of connected socket ids
  const socketIds = Object.keys(connectedSockets);

  // isSent will be true to the sender and false for everyone else
  for (let connectedSocket of connectedSockets) {
    connectedSocket[1].emit("message", {
      text: message.text,
      isSent: connectedSocket[1].id == message.senderSocketId,
    });
  }
};
