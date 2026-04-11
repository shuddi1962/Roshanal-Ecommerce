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
  const stubClient = {
    from: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ data: null, error: null }),
    },
  };
  db = stubClient;
  insforge = stubClient;
}

export { db }
export { insforge }
