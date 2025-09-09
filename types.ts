import type {
  Client,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type Logger from "./utils/logger";

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
  browserless?: string | null;
};

export type ExtendedClient = Client & {
  version: string;
  config: Config;
  logger: Logger;
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  restAPI: REST;
  pluginCount: number;
  lastCheck?: number;
};

export type LatestUpdateResponse = {
  id: number;
  resource: number;
  title: string;
  description: string;
  date: number;
  likes: number;
};
