import { Server, Socket } from "socket.io";
import User from "../models/user";
import { getChatRoomId } from "./utils";

export const calculatePreferenceScore = (user1: User, user2: User) => {
  const preferences1 = new Set(user1.preferences.split(">"));
  const preferences2 = new Set(user2.preferences.split(">"));

  //number of common preferences
  const commonPreferencesCount = [...preferences1].filter((pref) =>
    preferences2.has(pref)
  ).length;

  return commonPreferencesCount;
};

// current user against all the waiting users
export const findBestMatch = (user: User, candidates: User[]) => {
  let bestMatch = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    if (candidate.id !== user.id) {
      const score = calculatePreferenceScore(user, candidate);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }
  }

  return bestMatch;
};

export const connectUsers = (
  socket: Socket,
  io: Server,
  waitingQueue: User[],
  user: User,
  socketRefs: any
): Promise<User | undefined> => {
  return new Promise((resolve) => {
    let match = findBestMatch(user, waitingQueue);
    const chatRoomId = getChatRoomId();

    const userSocket = socket;

    // if no match is found, wait for 2 minutes
    if (!match) {
      const timeoutDuration = 2 * 60 * 1000; // 2 minutes
      const timer = setTimeout(() => {
        // if not matched after 2 minutes
        if (waitingQueue.length > 0 && waitingQueue[0].id != user.id)
          match = waitingQueue[0];
        if (match) {
          clearTimeout(timer);

          const matchSocket = socketRefs[match.id];

          // send the chat room ids so that they can join the room
          userSocket.emit("matched", chatRoomId);
          matchSocket.emit("matched", chatRoomId);

          userSocket.join(chatRoomId);
          matchSocket.join(chatRoomId);
          return match;
        } else {
          console.log("not found");
          socket.emit("error", "No match found");
        }
      }, timeoutDuration);
    } else {
      const matchSocket = socketRefs[match.id];

      userSocket.emit("matched", chatRoomId);
      matchSocket.emit("matched", chatRoomId);
      console.log("matched!", match.email);
      return match;
    }
  });
};
