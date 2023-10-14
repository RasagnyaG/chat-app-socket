import axios from "axios";
import User from "../models/user";

export const fetchUser = async (token: string) => {
  try {
    await axios
      .get("http://localhost:8000/api/get-user", {
        headers: {
          token: token,
        },
      })
      .then((user) => {
        return user;
      });
  } catch (error) {
    console.log(error);
  }
};
