const os = require('os')
const path = require('path')
const electron = require('electron')
const sqlite3 = require('sqlite3')
// Get the user data path, the directory in which the information will be stored.
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const db_filename = path.join(userDataPath, 'meta.db');

console.log(db_filename);

class Database {
  constructor(opts) {
    this.db = this.init_database();
    // this.last_image_id = 0;
  }

  /* Uses callback(boolean) to return if Projects contains name. */
  has_project(name, callback) {
    var bool = true;
    var stmt = this.db.prepare("SELECT * FROM Projects WHERE name = ?");
    stmt.get([name], function(err, row) {
      if (err) {
        console.error("FAILING: " + err);
        callback(false);
        return;
      }
      if (row == undefined) {
        bool = false;
      }

      callback(bool);
    });
    stmt.finalize();

    // /* Pass creation status, project name, and list of images to add to callback. */
    // callback(bool, name, image_paths);
  }

  /* TODO: Uses callback(boolean) to return whether or not proj_name has img_path. */
  has_image(img_path, proj_name, callback) {
    // return whether image with given path already exists for a given project
    var _this = this;
    var db = this.db;
    this.has_project(proj_name, function(bool) {
      if (!bool) {
        callback(false);
      } else {
        var stmt = db.prepare("SELECT * FROM Images WHERE path = ? AND proj_name = ?");
        stmt.get([img_path, proj_name], function(err, row) {
          var bool = true;
          if (err) {
            console.error("FAILING: " + err);
            callback(false);
            return;
          }
          if (row == undefined) {
            bool = false;
          }

          callback(bool);
        });
        stmt.finalize();
      }
    });
  }

  /* Uses callback(boolean) to return whether or not an image has metadata. */
  has_metadata(img_path, proj_name, callback) {

  }

  /* Use callback(success, name, img_paths) to return if project was successfully created. */
  add_project(name, description, img_paths, callback) {
    var _this = this;
    var db = this.db;
    var success = false;
    db.serialize(function() {
      _this.has_project(name, function(bool) {
        if (!bool) {
          var stmt = db.prepare("INSERT INTO Projects (name, description, creation, " +
                                "last_modified) VALUES (?, ?, ?, ?)");
          var created = Date.now();
          stmt.run(name, description, created, created);
          stmt.finalize();
          success = true;
        }

        callback(success, name, img_paths);
      });
    });
  }

  /* Uses callback(boolean) to return if image was added successfully or not. */
  add_image(img_name, img_path, proj_name, index, num_images, callback) {
    console.log("adding image: " + img_name);

    // Check if image has been made yet, if not create it
    var _this = this;
    var db = this.db;
    var success = false;
    db.serialize(function() {
      _this.has_image(img_path, proj_name, function(bool) {
        if (!bool) {
          var stmt = db.prepare("INSERT INTO Images (img_name, path, proj_name, " +
                                "creation, last_modified, tags, favorited, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
          var created = Date.now();
          stmt.run(img_name, img_path, proj_name, created, created, "", "", "");
          stmt.finalize();
          success = true;
        }
        callback(success, proj_name, img_path, index, num_images);
      });
    });
  }

  /* Get notes for an image. */
  get_notes(img_name, img_path, proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("SELECT notes FROM Images WHERE path=? AND proj_name=?");
      stmt.get([img_path, proj_name], function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          callback(img_name, proj_name, img_path, "");
          return;
        }

        callback(img_name, proj_name, img_path, row['notes']);
      });
      stmt.finalize();
    });
  }

  /* Update notes for an image. */
  update_notes(img_path, proj_name, notes) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("UPDATE Images SET notes=? WHERE path=? AND proj_name=?");
      stmt.run(notes, img_path, proj_name);
      stmt.finalize();
    });
  }

  /* Get tags for a project. */
  get_tags(img_name, img_path, proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("SELECT tags FROM Images WHERE path=? AND proj_name=?");
      stmt.get([img_path, proj_name], function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          callback(img_name, proj_name, img_path, []);
          return;
        }

        if (row['tags'].length == 0) {
          callback(img_name, proj_name, img_path, []);
          return;
        }

        var tags = row['tags'].split(',');
        var tags_array_dict_form = [];
        for (var i in tags) {
          tags_array_dict_form.push({value: tags[i], label: tags[i]});
        }
        callback(img_name, proj_name, img_path, tags_array_dict_form);
      });
      stmt.finalize();
    });
  }

  /* Update tags. */
  update_tag(proj_name, img_path, new_value) {
    var _this = this;
    var db = this.db;
    var stmt = db.prepare("UPDATE Images SET tags=? WHERE path=? AND proj_name=?");
    stmt.run(new_value, img_path, proj_name);
    stmt.finalize();
  }

  /* Add tag to an image. */
  add_tag(proj_name, img_path, tag) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("SELECT tags FROM Images WHERE path=? AND proj_name=?");
      stmt.get([img_path, proj_name], function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          return;
        }

        if (row['tags'].length == 0)
          _this.update_tag(proj_name, img_path, tag);
        else
          _this.update_tag(proj_name, img_path, row['tags'] + "," + tag);
      });
      stmt.finalize();
    });
  }

  /* Remove a tag from an image. */
  remove_tag(proj_name, img_path, tag) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("SELECT tags FROM Images WHERE path=? AND proj_name=?");
      stmt.get([img_path, proj_name], function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          return;
        }

        var tags = row['tags'].split(',');
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
        _this.update_tag(proj_name, img_path, tags.join());
      });
      stmt.finalize();
    });
  }

  /* Uses callback(img_path, proj_name, meta_dict, success) to add metadata in a dictionary. */
  // add_image_meta(img_path, proj_name, meta_dict, callback) {
  //   var _this = this;
  //   var db = this.db;
  //   db.serialize(function() {
  //     var columns = [];
  //     db.each("PRAGMA table_info(Images)", function(err, col) {
  //       if (err) {
  //         console.error("FAILING: " + err);
  //       }
  //       columns.push(col.name);
  //     }, function() {
  //       console.log('add_project: columns', columns);
  //       for (var meta_key in meta_dict) {
  //         meta_key = meta_key.replace("-", "_");
  //         var col_exists = (columns.indexOf(meta_key) >= 0);
  //         var meta_value = meta_dict[meta_key];
  //         if (!col_exists) {
  //           var meta_type = typeof meta_value;
  //           db.run("ALTER TABLE Images ADD " + meta_key + " " + meta_type + ";");
  //           console.log('add_project: col added', meta_key, meta_type);
  //         } else {
  //           console.log('contains column', columns[meta_key])
  //         }
  //       }
  //
  //       var success = false;
  //       _this.has_image(img_path, proj_name, function(bool) {
  //         if (bool) {
  //           var add_meta = "";
  //           var meta_length = Object.keys(meta_dict).length;
  //           var count = 0;
  //           var meta_values = [];
  //           for (var meta_key in meta_dict) {
  //             add_meta += meta_key + "=?";
  //             meta_values.push(meta_dict[meta_key]);
  //             if (count < meta_length - 1) {
  //               add_meta += ", ";
  //             }
  //             count++;
  //           }
  //           console.log(meta_values);
  //           var query = "UPDATE Images SET " + add_meta + " WHERE path=? AND proj_name=?";
  //           console.log(query, "query");
  //           var stmt = db.prepare(query);
  //           var params = meta_values + [img_path, proj_name];
  //           stmt.run(params);
  //           stmt.finalize();
  //           success = true;
  //         }
  //
  //         callback(success);
  //       });
  //     });
  //   });
  // }
  add_image_meta(imgname, img_path, proj_name, meta_key, meta_value, callback) {
    // set metadata for image
    // if column doesn't exist, add column
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var columns = [];
      db.each("PRAGMA table_info(Images)", function(err, col) {
        if (err) {
          console.error("FAILING: " + err);
          callback(false);
          return;
        }
        columns.push(col.name);
      }, function() {
        meta_key = meta_key.replace("-", "_");
        meta_value = JSON.stringify(meta_value);

        var col_exists = (columns.indexOf(meta_key) >= 0);
        if (!col_exists) {
          db.run("ALTER TABLE Images ADD " + meta_key + " TEXT;");
        }

        var success = false;
        _this.has_image(img_path, proj_name, function(bool) {
          if (bool) {
            var query = "UPDATE Images SET " + meta_key + "=? WHERE path=? AND proj_name=?";
            var stmt = db.prepare(query);
            stmt.run([meta_value, img_path, proj_name]);
            stmt.finalize();
            success = true;
          }

          callback(success, imgname, img_path, proj_name, meta_key, meta_value);
        });
      });
    });
  }

  /* Uses callback(img_path, proj_name, fave_bool, success) to add image to a projects favorites list. */
  update_favorite_image(img_path, proj_name, fave_bool, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var success = false;
      _this.has_image(img_path, proj_name, function(bool) {
        if (bool) {
          var fave_int = fave_bool ? 1 : 0;
          var query = "UPDATE Images SET favorited=? WHERE path=? AND proj_name=?";
          console.log(query, "query");
          var stmt = db.prepare(query);
          stmt.run([fave_int, img_path, proj_name]);
          stmt.finalize();
          success = true;
          console.log('add_favorite_image: image', img_path, 'favorited', proj_name);
        } else {
          console.log('add_favorite_image: image', img_path, 'does not exist in', proj_name);
        }
        callback(img_path, proj_name, fave_bool, success);
      });
    });
  }

  /* Uses callback(old_name, new_name, success) to update a project's name. */
  update_project_name(old_name, new_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var success = false;
      _this.has_project(old_name, function(bool) {
        if (bool) {
          _this.has_project(new_name, function(bool) {
            if (!bool) {
              var query = "UPDATE Projects SET name=? WHERE name=?";
              var stmt = db.prepare(query);
              stmt.run([new_name, old_name]);
              stmt.finalize();
              success = true;
              console.log('update_project_name: proj', old_name, 'updated', new_name);
            } else {
              console.log("update_project_name: proj", new_name, "is already a project");
            }
          });
        } else {
          console.log('update_project_name: proj', old_name, 'does not exist');
        }
        callback(old_name, new_name, success);
      });
    });
  }

  /* TODO */
  update_project_description(proj_name, description, callback) {
    // update project description
    var bool = true;
    callback(bool);
  }

  /* Get information for a specific project. */
  get_project(projectName, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt = db.prepare("SELECT * FROM Projects WHERE name=?");
      stmt.get([projectName], function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          callback({});
          return;
        }

        callback(row);
      });
      stmt.finalize();
    });
  }

  /* Use callback(list) to return a list of projects. */
  get_projects(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var projects = [];
      var stmt = db.prepare("SELECT * FROM Projects");
      stmt.each(function(err, row) {
        if (err) {
          console.error("FAILING: " + err);
          callback([]);
          return;
        }

        projects.push(row);
      }, function() {
        callback(projects);
      });
      stmt.finalize();
    });
  }

  /* Get thumbnail for specified project. */
  get_project_thumbnail(proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          var stmt = db.prepare("SELECT * FROM Images WHERE proj_name = ?");
          stmt.get([proj_name], function(err, row) {
            if (err) {
              console.error("FAILING: " + err);
              callback("");
              return;
            }

            if (row != undefined) {
              callback(row['path']);
            }
            else {
              callback("");
            }
          });
          stmt.finalize();
        } else {
          callback("");
        }
      });
    });
  }

  // TODO: add support for only showing images that satisfy a certain condition
  /* Uses callback(proj_name,  list) to return a list of images in a project. */
  get_images_in_project(proj_name, callback, filter_params) {
    // return list of tuples: (img_path, proj_name) — this is the PRIMARY KEY into the Images table
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          var stmt_str = "SELECT * FROM Images WHERE proj_name = ?"
          for (var field in filter_params) {
            if (field == 'tag' || field == 'tags' || field =='note' || field == 'notes') {
              stmt_str += " AND " + field + " LIKE '%" + filter_params[field] + "%'"
            } else {
              stmt_str += " AND " + field + " = " + filter_params[field]
            }
          }
          var stmt = db.prepare(stmt_str);
          stmt.all([proj_name], function(err, rows) {
            if (err) {
              console.error("FAILING: " + err);
              callback(proj_name, []);
              return;
            }

            callback(proj_name, rows);
          });
          stmt.finalize();
        } else {
          callback(proj_name, []);
        }
      });
    });
  }

  /* Uses callback(proj_name, list) to return a list of favorited images in a project. */
  get_favorite_images_in_project(proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          var images = [];
          var stmt = db.prepare("SELECT img_name, path FROM Images WHERE proj_name = ? AND favorited = 1");
          stmt.each([proj_name], function(err, row) {
            if (err) {
              console.error("FAILING: " + err);
              callback(proj_name, []);
              return;
            }

            images.push(row);
          }, function() {
            console.log('get_favorite_images_in_project:', images, 'in', proj_name);
            callback(proj_name, images);
          });
          stmt.finalize();
        } else {
          console.error('get_favorite_images_in_project:', proj_name, "does not exist");
          callback(proj_name, []);
        }
      });
    });
  }

  /* Uses callback(list) to return list of metadata fields. */
  get_metadata_fields(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var fields = [];
      var not_metadata = ["img_name", "path", "proj_name", "creation",
                          "last_modified", "tags", "favorited", "notes"];
      db.each("PRAGMA table_info(Images)", function(err, col) {
        if (err) {
          console.error("FAILING: " + err);
          callback([]);
          return;
        }

        var name = col.name;
        if (not_metadata.indexOf(name) < 0) {
          fields.push(name);
        }
      }, function() {
        callback(fields);
      });
    });
  }

  /* Uses callback(list) to return list of columns. */
  get_columns(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var fields = [];
      db.each("PRAGMA table_info(Images)", function(err, col) {
        if (err) {
          console.error("FAILING: " + err);
          callback([]);
          return;
        }

        var name = col.name;
        fields.push(name);
      }, function() {
        callback(fields);
      });
    });
  }

  /* Set favorite metadata in Settings table. */
  update_favorites_field(tag, type, checked) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      var stmt;
      if (checked) {
        /* Add to settings table. */
        stmt = db.prepare("INSERT INTO Settings (type, setting) VALUES (?, ?)");
      } else {
        /* Remove from settings table. */
        stmt = db.prepare("DELETE FROM Settings WHERE type=? AND setting=?");
      }
      stmt.run(type, tag);
      stmt.finalize();
      console.log("added favorite: " + tag + ", " + type + ", " + checked);
    });
  }

  /* Get favorite metadata from Settings table. */
  get_favorite_fields(callback) {
    var _this = this;
    var db = this.db;
    db.all("SELECT * FROM Settings", [], function(err, rows) {
      if (err) {
        console.error("FAILING: " + err);
        callback([], []);
        return;
      }

      var favorites = [];
      var csv = [];
      var row;
      for (var i in rows) {
        row = rows[i];
        if (row["type"] == "f") {
          favorites.push(row["setting"]);
        } else if (row["type"] == "c") {
          csv.push(row["setting"]);
        }
      }

      callback(favorites, csv);
    });
  }

  /* Returns whether a particular image has the specified metadata attribute. */
  has_metadata_attr(meta_attr, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.get_metadata_fields(function(fields) {
        var attr;
        for (var i in meta_attr) {
          attr = meta_attr[i];
          if (fields.indexOf(attr) < 0) {
            callback(false);
            return;
          }
        }
        callback(true);
      });
    });
  }

  /* Uses callback(bool, img_name, img_path, proj_name, {}) to return dict of metafields to metadata.
   * Ignores any fields that are not filled in. */
  get_image_metadata(img_path, img_name, proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_image(img_path, proj_name, function(bool) {
        if (!bool) {
          callback(false, img_name, img_path, proj_name, {});
        } else {
          var not_metadata = ["img_name", "path", "proj_name", "creation",
                              "last_modified", "tags", "favorited", "notes"];
          var stmt = db.prepare("SELECT * FROM Images WHERE path=? AND proj_name=?");
          stmt.get([img_path, proj_name], function(err, row) {
            for (var key in row) {
              if (row[key] == null || not_metadata.indexOf(key) >= 0) {
                delete row[key];
              }
            }
            callback(true, img_name, img_path, proj_name, row);
          });
          stmt.finalize();
        }
      });
    });
  }

  /* Helper function to convert an ExifDateTime instance to an appropriate format for the timeline chart. */
  date_to_chart_format(exifDateTime) {
    var year = exifDateTime.year;
    var month = exifDateTime.month;
    var day = exifDateTime.day;
    var hour = exifDateTime.hour;
    var minute = exifDateTime.minute;

    return month + "/" + day + "/" + year + " at " + hour + ":" + minute;
  }

  /* Get count of images by the date at which they were taken, for the specified project. */
  get_images_by_date(proj_name, callback, filter_params = {}) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          _this.has_metadata_attr(['CreateDate'], function(attr_exists) {
            if (attr_exists) {
              console.log("CreateDate exists");
              var dates = [];
              var counts = [];
              var stmt_str = "SELECT CreateDate, COUNT(*) as Count FROM Images WHERE proj_name = ? AND "
              for (var field in filter_params) {
                if (field == 'tag' || field == 'tags' || field =='note' || field == 'notes') {
                  stmt_str += field + " LIKE '%" + filter_params[field] + "%' AND "
                } else {
                  stmt_string += field + " = " + filter_params[field] + " AND "
                }
              }
              stmt_str += "CreateDate IS NOT NULL GROUP BY CreateDate"
              var stmt = db.prepare(stmt_str);
              stmt.each([proj_name], function(err, row) {
                if (err) {
                  console.error("FAILING CreateDate: " + err);
                  callback([], []);
                  return;
                }

                var date = _this.date_to_chart_format(JSON.parse(row['CreateDate']));

                if (dates.indexOf(date) >= 0) {
                  counts[dates.indexOf(date)] += 1;
                } else {
                  dates.push(date);
                  counts.push(row['Count']);
                }
              }, function() {
                callback(dates, counts);
              });
            } else {
              console.error("column DNE: CreateDate");
              callback([], []);
            }
          });
        } else {
          console.error("no image dates found");
          callback([], []);
        }
      });
    });
  }

  /* Get list of (lat, lon) tuples for each image in a specific project, to represent the image location. */
  get_locations_for_images(proj_name, callback, filter_params = {}) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          _this.has_metadata_attr(['GPSLatitude', 'GPSLongitude'], function(attr_exists) {
            if (attr_exists) {
              var coords = [];
              var stmt_str = "SELECT GPSLatitude, GPSLongitude FROM Images WHERE proj_name = ? AND "
              for (var field in filter_params) {
                if (field == 'tag' || field == 'tags' || field =='note' || field == 'notes') {
                  stmt_str += field + " LIKE '%" + filter_params[field] + "%' AND "
                } else {
                  stmt_string += field + " = " + filter_params[field] + " AND "
                }
              }
              stmt_str += "GPSLatitude IS NOT NULL AND GPSLongitude IS NOT NULL"
              var stmt = db.prepare(stmt_str);
              stmt.each([proj_name], function(err, row) {
                if (err) {
                  console.error("FAILING: " + err);
                  callback([]);
                  return;
                }

                coords.push({'lat': JSON.parse(row['GPSLatitude']), 'lng': JSON.parse(row['GPSLongitude'])});
              }, function() {
                console.log('get_locations_for_images:', coords, 'in', proj_name);
                callback(coords);
              });
              stmt.finalize();
            } else {
              console.error("column DNE: GPSLatitude, GPSLongitude");
              callback([]);
            }
          });
        } else {
          console.error('get_locations_for_images:', proj_name, "does not exist");
          callback([]);
        }
      });
    });
  }

  /* Get count of images by the camera model used to take the image, for the specified project. */
  get_camera_models(proj_name, callback, filter_params = {}) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          _this.has_metadata_attr(['Model'], function(attr_exists) {
            if (attr_exists) {
              var models = [];
              var counts = [];
              var stmt_str = "SELECT Model, COUNT(*) AS Count FROM Images WHERE proj_name=? AND "
              for (var field in filter_params) {
                if (field == 'tag' || field == 'tags' || field =='note' || field == 'notes') {
                  stmt_str += field + " LIKE '%" + filter_params[field] + "%' AND "
                } else {
                  stmt_string += field + " = " + filter_params[field] + " AND "
                }
              }
              stmt_str += "Model IS NOT NULL GROUP BY Model"
              var stmt = db.prepare(stmt_str);
              stmt.each([proj_name], function(err, row) {
                if (err) {
                  console.error("FAILING: " + err);
                  callback([], []);
                  return;
                }

                models.push(JSON.parse(row['Model']));
                counts.push(row['Count']);
              }, function() {
                callback(models, counts);
              });
            } else {
              console.error("columns DNE: Model");
              callback([], []);
            }
          });
        } else {
          console.error('get_locations_for_images:', proj_name, "does not exist");
          callback([], []);
        }
      });
    });
  }

  /* Get count of images by aperture, for the specified project. */
  get_apertures(proj_name, callback, filter_params = {}) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_project(proj_name, function(bool) {
        if (bool) {
          _this.has_metadata_attr(['Aperture'], function(attr_exists) {
            if (attr_exists) {
              var apertures = [];
              var counts = [];
              var stmt_str = "SELECT COUNT(*) as Count, Aperture FROM Images WHERE proj_name=? AND "
              for (var field in filter_params) {
                if (field == 'tag' || field == 'tags' || field =='note' || field == 'notes') {
                  stmt_str += field + " LIKE '%" + filter_params[field] + "%' AND "
                } else {
                  stmt_str += field + " = " + filter_params[field] + " AND "
                }
              }
              stmt_str += "Aperture IS NOT NULL GROUP BY Aperture"
              var stmt = db.prepare(stmt_str);
              stmt.each([proj_name], function(err, row) {
                if (err) {
                  console.error("FAILING: " + err);
                  callback([], []);
                  return;
                }

                apertures.push(JSON.parse(row['Aperture']));
                counts.push(row['Count']);
              }, function() {
                callback(apertures, counts);
              });
              stmt.finalize();
            } else {
              console.error("column DNE: Aperture");
              callback([], []);
            }
          });
        } else {
          console.error('get_apertures:', proj_name, "does not exist");
          callback([], []);
        }
      });
    });
  }

  /* Get counts of images by date across all projects. */
  get_all_image_dates(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_metadata_attr(['CreateDate'], function(attr_exists) {
        if (attr_exists) {
          console.log("CreateDate exists");
          var dates = [];
          var counts = [];
          var stmt = db.prepare("SELECT CreateDate, COUNT(*) as Count FROM Images WHERE CreateDate IS NOT NULL GROUP BY CreateDate");
          stmt.each([], function(err, row) {
            if (err) {
              console.error("FAILING CreateDate: " + err);
              callback([], []);
              return;
            }

            var date = _this.date_to_chart_format(JSON.parse(row['CreateDate']));

            if (dates.indexOf(date) >= 0) {
              counts[dates.indexOf(date)] += 1;
            } else {
              dates.push(date);
              counts.push(row['Count']);
            }
          }, function() {
            callback(dates, counts);
          });
        } else {
          console.error("column DNE: CreateDate");
          callback([], []);
        }
      });
    });
  }

  /* Get locations for images across all projects. */
  get_all_image_locations(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_metadata_attr(['GPSLatitude', 'GPSLongitude'], function(attr_exists) {
        if (attr_exists) {
          var coords = [];
          var stmt = db.prepare("SELECT GPSLatitude, GPSLongitude FROM Images WHERE GPSLatitude IS NOT NULL AND GPSLongitude IS NOT NULL");
          stmt.each([], function(err, row) {
            if (err) {
              console.error("FAILING: " + err);
              callback([]);
              return;
            }

            coords.push({'lat': JSON.parse(row['GPSLatitude']), 'lng': JSON.parse(row['GPSLongitude'])});
          }, function() {
            callback(coords);
          });
          stmt.finalize();
        } else {
          console.error("column DNE: GPSLatitude, GPSLongitude");
          callback([]);
        }
      });
    });
  }

  /* Get camera models for images across all projects. */
  get_all_image_models(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_metadata_attr(['Model'], function(attr_exists) {
        if (attr_exists) {
          var models = [];
          var counts = [];
          var stmt = db.prepare("SELECT Model, COUNT(*) AS Count FROM Images WHERE Model IS NOT NULL GROUP BY Model");
          stmt.each([], function(err, row) {
            if (err) {
              console.error("FAILING: " + err);
              callback([], []);
              return;
            }

            models.push(JSON.parse(row['Model']));
            counts.push(row['Count']);
          }, function() {
            callback(models, counts);
          });
        } else {
          console.error("columns DNE: Model");
          callback([], []);
        }
      });
    });
  }

  /* Get apertures for images across all projects. */
  get_all_image_apertures(callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_metadata_attr(['Aperture'], function(attr_exists) {
        if (attr_exists) {
          var apertures = [];
          var counts = [];
          var stmt = db.prepare("SELECT COUNT(*) as Count, Aperture FROM Images WHERE Aperture IS NOT NULL GROUP BY Aperture");
          stmt.each([], function(err, row) {
            if (err) {
              console.error("FAILING: " + err);
              callback([], []);
              return;
            }

            apertures.push(JSON.parse(row['Aperture']));
            counts.push(row['Count']);
          }, function() {
            callback(apertures, counts);
          });
          stmt.finalize();
        } else {
          console.error("column DNE: Aperture");
          callback([], []);
        }
      });
    });
  }

  /* Uses callback(img_path, proj_name, dictionary) to return dict of metafields to metadata.
   * Ignores any fields that are not filled in or not selected. */
  get_selected_image_metadata(img_path, proj_name, selected, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      _this.has_image(img_path, proj_name, function(bool) {
        if (!bool) {
          callback({});
        } else {
          var not_metadata = ["img_name", "path", "proj_name", "creation",
                      "last_modified", "tags", "favorited", "notes"];
          var stmt = db.prepare("SELECT * FROM Images WHERE path=? AND proj_name=?");
          stmt.get([img_path, proj_name], function(err, row) {
            for (var key in row) {
              if (row[key] == null || not_metadata.indexOf(key) >= 0
                  || selected.indexOf(key) < 0) {
                delete row[key];
              }
            }
            stmt.finalize();

            callback(img_path, proj_name, row);
          });
        }
      });
    });
  }

  /* Deletes the specified project from the database. */
  delete_project(proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      /* Delete relevant images from Images table. */
      stmt = db.prepare("DELETE FROM Images WHERE proj_name=?");
      stmt.run([proj_name], function(err) {
        if (err) {
          console.error("FAILING: " + err);
          callback(false);
          return;
        }
      });
      stmt.finalize();
      callback(true);
    });

    /* Delete project from Projects table. */
    var stmt = db.prepare("DELETE FROM Projects WHERE name=?");
    stmt.run([proj_name], function(err) {
      if (err) {
        console.error("FAILING: " + err);
        callback(false);
        return;
      } else {
        callback(true);
      }
    });
    stmt.finalize();
  }

  /* Deletes the specified image from the project. */
  delete_image(img_name, proj_name, callback) {
    var _this = this;
    var db = this.db;
    db.serialize(function() {
      /* Delete relevant images from Images table. */
      var stmt = db.prepare("DELETE FROM Images WHERE img_name=? AND proj_name=?");
      stmt.run([img_name, proj_name], function(err) {
        if (err) {
          console.error("FAILING: " + err);
          callback(false);
        } else {
          callback(true);
        }
      });
      stmt.finalize();
    });
  }

  init_database() {
    var db = new sqlite3.Database(db_filename, (err) => {
      if (err) {
        throw err;
      }

      // if meta.db was just created, create Images and Projects tables.
      this.create_tables_if_new_db(db);
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
                                   "creation NUMERIC, last_modified NUMERIC, tags TEXT, favorited TEXT, " +
                                   "notes TEXT)";
          db.run(create_image_table);
        }

        if (err) {
          throw err;
        }
      });

      // check if Projects table exists, and create if it does not
      db.get(project_query, (err, row) => {
        if (row == undefined) {
          var create_project_table = "CREATE TABLE Projects (name TEXT, description TEXT," +
                                     "creation NUMERIC, last_modified NUMERIC)";
          db.run(create_project_table);
        }

        if (err) {
          throw err;
        }
      });

      // check if Settings table exists, and create if it does not
      db.get(setting_query, (err, row) => {
        if (row == undefined) {
          var create_setting_table = "CREATE TABLE Settings (type TEXT, setting TEXT)";
          db.run(create_setting_table);
        }

        if (err) {
          throw err;
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

  /* Never use this in code, only use for testing. */
  clear_database(callback) {
    this.db.run("DROP TABLE Projects; DROP TABLE Images; DROP TABLE Settings;");
    callback();
  }
}

module.exports = Database;
