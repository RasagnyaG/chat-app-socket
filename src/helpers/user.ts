import axios from "axios";
import User from "../models/user";

export const fetchUser = async (token: string) => {
  try {
    await axios
      .get(process.env.API_BASE_URL + "/user/get-user", {
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
