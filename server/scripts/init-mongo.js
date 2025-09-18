// Initializes the ntfg_hrms database and creates an application user
// This runs automatically when the MongoDB container starts

db = db.getSiblingDB('ntfg_hrms');

// Create app user with readWrite role
try {
  db.createUser({
    user: 'appuser',
    pwd: 'appPass123',
    roles: [ { role: 'readWrite', db: 'ntfg_hrms' } ]
  });
  print('✅ Created MongoDB app user: appuser');
} catch (e) {
  print('ℹ️  App user may already exist:', e.message);
}

print('✅ MongoDB init script completed');