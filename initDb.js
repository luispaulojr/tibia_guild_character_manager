const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./characters.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS characters (name TEXT PRIMARY KEY, role TEXT, location TEXT)");

    // Insert initial data if needed
    const stmt = db.prepare("INSERT OR IGNORE INTO characters VALUES (?, ?, ?)");
    stmt.run("Example Character", "MWALLER", "Unknown Location");
    stmt.finalize();
});

db.close();
