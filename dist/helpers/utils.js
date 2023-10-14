"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatRoomId = void 0;
const getChatRoomId = () => {
    const chatRoomId = "ROOM" + Math.random().toString(36).substr(2, 9).toUpperCase;
    return chatRoomId;
};
exports.getChatRoomId = getChatRoomId;
