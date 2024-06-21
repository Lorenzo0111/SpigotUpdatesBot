import axios from "axios";

export default axios.create({
  headers: {
    common: {
      "User-Agent": "SpigotUpdatesBot",
    },
  },
});
