import dotenv from "dotenv";
import path from "path";
import { Knex } from "knex";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "./seeds"),
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "./seeds"),
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
