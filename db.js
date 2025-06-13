const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sqlite.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario TEXT NOT NULL
    )
  `);
});

module.exports = {
  getAllScenarios: () =>
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM scenarios', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    }),
  addScenario: (scenario) =>
    new Promise((resolve, reject) => {
      db.run('INSERT INTO scenarios (scenario) VALUES (?)', [scenario], function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID, scenario });
      });
    }),
  deleteScenario: (id) =>
    new Promise((resolve, reject) => {
      db.run('DELETE FROM scenarios WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        resolve(this.changes);
      });
    }),
};
