// Runs a .sql file against the project's Supabase Postgres via psql, using
// SUPABASE_DB_URL from .env. Used by the npm db:reset/db:seed scripts so test
// data can be reset from the terminal instead of the Supabase dashboard SQL editor.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue = ""] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(path.join(__dirname, "..", ".env"));

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-sql.js <path-to-sql-file>");
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error(
    "SUPABASE_DB_URL is not set. Add it to your .env — see .env.example for where to find it.",
  );
  process.exit(1);
}

const result = spawnSync("psql", [connectionString, "-f", sqlFile], {
  stdio: "inherit",
});

if (result.error) {
  if (result.error.code === "ENOENT") {
    console.error(
      "psql was not found. Install the PostgreSQL client tools and make sure `psql` is on your PATH.",
    );
  } else {
    console.error(result.error);
  }
  process.exit(1);
}

process.exit(result.status ?? 1);
