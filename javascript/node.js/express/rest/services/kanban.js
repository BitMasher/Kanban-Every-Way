const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

class Kanban {
	constructor() {
		db.serialize(() => {
			db.run(`
			CREATE TABLE IF NOT EXISTS cards (
			[id] TEXT PRIMARY KEY,
			[name] TEXT,
			[priority] TEXT,
			[column] TEXT,
			[body] TEXT
			);
			`)
		})
	}

	getKanban() {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM cards", (err, rows) => {
				if (err) {
					reject(err);
					return;
				}
				let processed = rows.reduce((acc, cur) => {
					if (!acc[cur.column]) acc[cur.column] = [];
					acc[cur.column].push({
						id: cur.id,
						name: cur.name,
						priority: cur.priority,
						body: cur.body
					});
					return acc;
				}, {'Todo': [], 'In Progress': [], 'Done': []});
				resolve(processed);
			})
		});
	}

	getCard(cardId) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare("SELECT * FROM cards WHERE [id] = ?");
			stmt.get(cardId, (err, row) => {
				if(err) reject(err);
				resolve(row);
			})
			stmt.finalize();
		})
	}

	setCard(card) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare("INSERT INTO cards ([id], [name], [priority], [body], [column]) VALUES(?, ?, ?, ?, ?) ON CONFLICT([id]) DO UPDATE SET [name]=excluded.[name], [priority]=excluded.[priority], [body]=excluded.[body], [column]=excluded.[column]");
			stmt.run(card.id, card.name, card.priority, card.body, card.column, (err) => {
				if(err) {
					reject(err);
				}
			});
			stmt.finalize(() => {
				let stmt2 = db.prepare("SELECT * FROM cards WHERE id = ?");
				stmt2.get(card.id, (err, row) => {
					resolve(row);
				});
				stmt2.finalize();
			});
		});
	}

	deleteCard(cardId) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare("DELETE FROM cards WHERE [id] = ?");
			stmt.run(cardId, (err) => {
				if(err) {
					reject(err);
					return;
				}
				resolve();
			});
			stmt.finalize();
		});
	}
}

module.exports = new Kanban();
