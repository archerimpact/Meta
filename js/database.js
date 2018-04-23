const os = require('os')
var sqlite3 = require('sqlite3');
var db_filename = './db/meta.sqlite'

class Database {
  constructor(opts) {
    this.db = this.init_database();
  }
  
  init_database() {
    var db = new sqlite3.Database(db_filename, (err) => {
      if (err) {
        console.error(err.message);
      }

      // if meta.db was just created, create Images and Projects tables.
      this.create_tables_if_new_db();

      console.log('Connected to the meta database.');
    });

    return db;
  }

  create_tables_if_new_db() {
    var image_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Images'";
    var project_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Projects'";
    var setting_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Settings'";

    // check if Images table exists, and create if it does not
    this.db.get(image_query, (err, row) => {
      if (row == undefined) {
        var create_image_table = "CREATE TABLE Images (name TEXT, id INTEGER, creation NUMERIC, update NUMERIC, tags TEXT, starred TEXT, notes TEXT)";
        this.db.run(create_image_table);
        console.log("create Images");
      } else {
        console.log("Images already exists");
      }
    });

    // check if Projects table exists, and create if it does not
    this.db.get(project_query, (err, row) => {
      if (row == undefined) {
        var create_project_table = "CREATE TABLE Projects (name TEXT, id INTEGER, description TEXT)";
        this.db.run(create_project_table);
        console.log("create Projects");
      } else {
        console.log("Projects already exists");
      }
    });

    // check if Settings table exists, and create if it does not
    this.db.get(setting_query, (err, row) => {
      if (row == undefined) {
        var create_setting_table = "CREATE TABLE Settings (type TEXT, setting TEXT)";
        this.db.run(create_setting_table);
        console.log("create Settings");
      } else {
        console.log("Settings already exists");
      }
    });
  }

}

module.exports = Database