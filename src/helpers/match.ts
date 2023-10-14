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
) => {
  let match = findBestMatch(user, waitingQueue);
  const chatRoomId = getChatRoomId();

  const userSocket = socketRefs[user.id];

  // if no match is found, wait for 2 minutes
  if (!match) {
    const timeoutDuration = 2 * 60 * 1000; // 2 minutes
    const timer = setTimeout(() => {
      // if not matched after 2 minutes
      match = waitingQueue[0];
      if (match) {
        clearTimeout(timer);

        const matchSocket = socketRefs[match.id];
        // send the chat room ids so that they can join the room
        userSocket.emit("matched", chatRoomId);
        matchSocket.emit("matched", chatRoomId);
        return match;
      }
    }, timeoutDuration);
  } else {
    const matchSocket = socketRefs[match.id];

    userSocket.emit("matched", chatRoomId);
    matchSocket.emit("matched", chatRoomId);
    return match;
  }
};
