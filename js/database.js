const os = require('os')
const path = require('path')
const electron = require('electron')
const sqlite3 = require('sqlite3')
// Get the user data path, the directory in which the information will be stored.
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const db_filename = path.join(userDataPath, 'meta.db');

class Database {
  constructor(opts) {
    this.db = this.init_database();
  }

  update_image(name, proj_name, data_dict_questionmark) {
    // Check if image has been made yet, if not create it

    // Update each column for row, create column if it didn't exist before

    // Update last_modified field
  }

  create_image(name, proj_name) {
    
  }
  
  init_database() {
    var db = new sqlite3.Database(db_filename, (err) => {
      if (err) {
        console.error(err.message);
      }

      // if meta.db was just created, create Images and Projects tables.
      this.create_tables_if_new_db(db);

      console.log('Connected to the meta database.');
    });

    return db;
  }

  create_tables_if_new_db(db) {
    var image_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Images'";
    var project_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Projects'";
    var setting_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='Settings'";


    var db = this.db;

    db.serialize(function() {
      // check if Images table exists, and create if it does not
      db.get(image_query, (err, row) => {
        if (row == undefined) {
          var create_image_table = "CREATE TABLE Images (name TEXT, proj_name TEXT, creation NUMERIC," +
                                   "last_modified NUMERIC, tags TEXT, starred TEXT, notes TEXT)";
          db.run(create_image_table);
          console.log("create Images");
        } else {
          console.log("Images already exists");
        }

        if (err) {
          console.log("Error during Images construction: " + err);
        }
      });

      // check if Projects table exists, and create if it does not
      db.get(project_query, (err, row) => {
        if (row == undefined) {
          var create_project_table = "CREATE TABLE Projects (name TEXT, description TEXT," +
                                     "creation NUMERIC, last_modified NUMERIC)";
          db.run(create_project_table);
          console.log("create Projects");
        } else {
          console.log("Projects already exists");
        }

        if (err) {
          console.log("Error during Projects construction: " + err);
        }
      });

      // check if Settings table exists, and create if it does not
      db.get(setting_query, (err, row) => {
        if (row == undefined) {
          var create_setting_table = "CREATE TABLE Settings (type TEXT, setting TEXT)";
          db.run(create_setting_table);
          console.log("create Settings");
        } else {
          console.log("Settings already exists");
        }

        if (err) {
          console.log("Error during Settings construction: " + err);
        }
      });
    });
  }

  get_database() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = Database
