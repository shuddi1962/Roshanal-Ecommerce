// During build/prerendering, provide a stub to avoid connection errors
let insforge: any;
let db: any;

try {
  const dbModule = require('./db');
  db = dbModule.db;
  insforge = db;
} catch (error) {
  // During prerendering, environment variables might not be available
  // Provide a stub object that won't crash the build
  db = {};
  insforge = {};
}

export { db }
export { insforge }
