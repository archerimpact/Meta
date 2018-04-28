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
    this.last_image_id = 0;
  }

  create_project(name, description) {
    // potentially serialize? might solve table creation issue
    var _this = this;
    var db = this.db;
    var bool = true;
    db.serialize(function() {
      if (_this.has_project(callback)) {
        console.log("create_project:", name, "is already a project")
        bool = false;
      } else {
        console.log('create_project: ' + name + " " + description)
        var stmt = db.prepare("INSERT INTO Projects (name, description, creation, last_modified) VALUES (?, ?, ?, ?)");
        var created = Date.now();
        stmt.run(name, description, created, created);
        stmt.finalize();
      }
    });
  }

  /*** Returns list of projects. ***/
  get_projects(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var projects = [];
      var stmt = db.prepare("SELECT name FROM Projects");
      stmt.each(function(err, row) {
        if (err) {
          throw error;
        }
        projects.push(row);
      }, function() {
        console.log('projects inside: ', projects);
        callback(projects);
      });
      stmt.finalize();
    });
  }


  /* Uses callback(bool) to return if Projects contains name. */
  has_project(name, callback) {
    var bool = true;
    var stmt = this.db.prepare("SELECT * FROM Projects WHERE name = ?");
    stmt.get([name], function(err, row) {
      if (err) {
        throw error;
      }
      console.log('has_project row: ', row);
      if (row == undefined) {
        bool = false;
      }
      callback(bool);
    });
  }

  update_project_name(old_name, new_name, callback) {
    if(this.has_project(new_name)) {
      // alert that can't use this name
      callback(false);
    }
    // update name
    callback(true);
  }

  update_project_description(proj_name, description, callback) {
    // update project description
    var bool = true;
    callback(bool);
  }

  // TODO: add support for only showing images that satisfy a certain condition
  get_all_images_by_project(proj_name, callback) {
    // return list of tuples: (image_path, proj_name) — this is the PRIMARY KEY into the Images table
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      if (!_this.has_project(proj_name)) {
        console.error('Project', proj_name, "does not exist")
        callback([]);
      } else {
        var images = [];
        var stmt = db.prepare("SELECT img_name, path FROM Images WHERE proj_name = ?");
        stmt.each([proj_name], function(err, row) {
          if (err) {
            throw error;
          }
          images.push(row);
        }, function() {
          console.log('images inside: ', images);
          callback(images);
        });
        stmt.finalize();
      }
    });
  }

  get_images_with_metadata(callback) {
    // return all images that have non-empty metadata fields
    var bool = true;
    callback(bool);
  }

  /* Uses callback(bool) to return whether or not proj_name has img_path. */
  has_image(img_path, proj_name, callback) {
    // return whether image with given path already exists for a given project
    var bool = true;
    var stmt = this.db.prepare("SELECT * FROM Images WHERE path = ? AND proj_name = ?");
    stmt.get([img_path, proj_name], function(err, row) {
      if (err) {
        throw error;
      }
      console.log('has_image row: ', row);
      if (row == undefined) {
        bool = false;
      }
      callback(bool);
    });
  }

  add_image(image_name, image_path, proj_name, callback) {
    // Check if image has been made yet, if not create it
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_image(image_path, proj_name, function(bool) {
        if(bool) {
          console.log('image ', image_name, ' already in ', proj_name);
          bool = false;
        } else {
          console.log('add_image: ' + image_name + " " + image_path + " " + proj_name)
          var stmt = db.prepare("INSERT OR REPLACE INTO Images (img_name, path, proj_name, " +
                                     "creation, last_modified) VALUES (?, ?, ?, ?, ?)");
          var created = Date.now();
          stmt.run(image_name, image_path, proj_name, created, created);
          stmt.finalize();
        }
      });
    });
  }

  add_image_meta(img_path, proj_name, meta_key, meta_value, callback) {
    // set metadata for image
    // if column doesn't exist, add column
    var bool = true;
    callback(bool);
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
          var create_image_table = "CREATE TABLE Images (img_name TEXT, path TEXT, proj_name TEXT, " +
                                   "creation NUMERIC, last_modified NUMERIC, tags TEXT, starred TEXT, " +
                                   "notes TEXT)";
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
