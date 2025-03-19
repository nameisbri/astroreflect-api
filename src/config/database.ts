import knex from "knex";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

// Determine the correct knexfile path
const env = process.env.NODE_ENV || "development";
const knexfilePath = path.join(__dirname, "../db/knexfile.ts");

// Check if knexfile exists
if (!fs.existsSync(knexfilePath)) {
  console.error(`Knexfile not found at ${knexfilePath}`);
  process.exit(1);
}

// Dynamic import for knexfile
let knexConfig: any;
try {
  // Try to load the config dynamically
  const configPath = path.resolve(knexfilePath);
  knexConfig = require(configPath).default[env];

  if (!knexConfig) {
    throw new Error(`No configuration found for environment: ${env}`);
  }
} catch (error) {
  console.error("Error loading knex configuration:", error);
  process.exit(1);
}

// Initialize database connection
const db = knex(knexConfig);

// Test database connection
db.raw("SELECT 1")
  .then(() => {
    console.log(`Database connection established (${env} environment)`);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

export default db;
