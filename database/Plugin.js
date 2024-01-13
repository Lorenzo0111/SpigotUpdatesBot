const { model, Schema } = require("mongoose");

module.exports = model(
  "Plugin",
  new Schema({
    id: String,
    latest: Number,
    server: String,
    channel: String,
    ping: String,
  })
);
