"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectUsers = exports.findBestMatch = exports.calculatePreferenceScore = void 0;
const utils_1 = require("./utils");
const calculatePreferenceScore = (user1, user2) => {
    const preferences1 = new Set(user1.preferences.split(">"));
    const preferences2 = new Set(user2.preferences.split(">"));
    //number of common preferences
    const commonPreferencesCount = [...preferences1].filter((pref) => preferences2.has(pref)).length;
    return commonPreferencesCount;
};
exports.calculatePreferenceScore = calculatePreferenceScore;
// current user against all the waiting users
const findBestMatch = (user, candidates) => {
    let bestMatch = null;
    let bestScore = -1;
    for (const candidate of candidates) {
        if (candidate.id !== user.id) {
            const score = (0, exports.calculatePreferenceScore)(user, candidate);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = candidate;
            }
        }
    }
    return bestMatch;
};
exports.findBestMatch = findBestMatch;
const connectUsers = (socket, io, waitingQueue, user, socketRefs) => {
    let match = (0, exports.findBestMatch)(user, waitingQueue);
    const chatRoomId = (0, utils_1.getChatRoomId)();
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
    }
    else {
        const matchSocket = socketRefs[match.id];
        userSocket.emit("matched", chatRoomId);
        matchSocket.emit("matched", chatRoomId);
        return match;
    }
};
exports.connectUsers = connectUsers;
