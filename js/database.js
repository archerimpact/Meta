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

function create_tables_if_new_db() {
  var query_template = "SELECT name FROM sqlite_master WHERE type='table' AND name='{0}'";
  var image_query = query_template.format("Images");
  var project_query = query_template.format("Projects");
  var setting_query = query_template.format("Settings");

  // check if Images table exists, and create if it does not
  db.get(image_query, (err, row) {
    if (row == undefined) {
      var create_table = "CREATE TABLE Images (name TEXT, id NUM, creation DATE)";
      return true;
    }
  });

  // check if Projects table exists, and create if it does not
}
