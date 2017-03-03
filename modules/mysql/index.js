"use strict";

var mysql = require('mysql');

var database = {
  connection : mysql.createConnection( {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'hotel'
  }),
  init       : function() {
   
    console.log('inicializando la base de datos');
    this.connection.connect();
    // Creates initial configuration table and sets defaults.
    var configTable = "CREATE TABLE IF NOT EXISTS registro(" +
      "id INT NOT NULL AUTO_INCREMENT," +
      "PRIMARY KEY(id)," +
      "ip VARCHAR(30) NOT NULL," +
      "nombre VARCHAR(30)" +
      ");";

    console.log(configTable);
    database.connection.query( configTable, function( err ) {
      if(err){
        throw err;
      }else{
        console.log('connection successful');
      }
    });
  }
};

module.exports = database;
