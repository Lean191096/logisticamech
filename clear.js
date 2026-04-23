const Database = require('better-sqlite3');
const db = new Database('dev.db');

db.exec('DELETE FROM Pedido');
db.exec('DELETE FROM Ruta');
db.exec('DELETE FROM Cliente');

console.log('Tablas limpiadas con éxito.');
db.close();
