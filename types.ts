import type { Client, REST } from "discord.js";
import type Logger from "./utils/Logger";
import type { HydratedDocument } from "mongoose";

export type Config = {
  token: string;
  public: boolean;
  api: {
    enabled: boolean;
    port: number;
    topgg: string;
    guild: string;
  };
  database: string;
  message: string;
};

export type ExtendedClient = Client & {
  version: string;
  config: Config;
  logger: Logger;
  commands: any;
  restAPI: REST;
  pluginCount: number;
  lastCheck?: number;
};

export interface PluginType {
  id: string;
  latest: number;
  server: string;
  channel: string;
  ping: string;
}

export type PluginModel = HydratedDocument<PluginType>;

export type LatestUpdateResponse = {
  id: number;
  resource: number;
  title: string;
  description: string;
  date: number;
  likes: number;
};
