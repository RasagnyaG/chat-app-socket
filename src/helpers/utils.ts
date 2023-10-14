export const getChatRoomId = () => {
  const chatRoomId =
    "ROOM" + Math.random().toString(36).substr(2, 9).toUpperCase;
  return chatRoomId;
};
