const os = require('os')
var sqlite3 = require('sqlite3').verbose();
var db_filename = './db/meta.db'

function init_database() {
  var db = new sqlite3.Database(db_filename, (err) => {
    if (err) {
      console.error(err.message);
    }

    // if meta.db was just created, create Images and Projects tables.


    console.log('Connected to the meta database.');
  });
}

function table_exists(table_name) {
  var query = 'SELECT name FROM sqlite_master WHERE type="table" AND name="{0}"'.format(table_name);
  db.get(query, (err, row) {
    if (!err) {
      return true;
    }
  });
}
