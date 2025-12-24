import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true, // allows sending cookie
});

export default API;