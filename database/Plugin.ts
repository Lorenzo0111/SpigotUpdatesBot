import { model, Schema } from "mongoose";
import type { PluginType } from "../types";

export default model<PluginType>(
  "Plugin",
  new Schema<PluginType>({
    id: String,
    latest: Number,
    server: String,
    channel: String,
    ping: String,
  })
);
