export const getChatRoomId = () => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let chatRoomId = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    chatRoomId += charset[randomIndex];
  }
  return chatRoomId;
};
