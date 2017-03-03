"use strict";

var mysql = require( 'mysql' );

var database = {
  connection : mysql.createConnection( {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root',
    database : 'hotel'
  } ),
  init       : function() {
    this.connection.connect();
    var configUsuarios = "CREATE TABLE IF NOT EXISTS usuarios(" +
      "id INT NOT NULL AUTO_INCREMENT," +
      "PRIMARY KEY(id)," +
      "correo VARCHAR(30) NOT NULL," +
      "contraseña VARCHAR(30) NOT NULL" +
      ");";
    var configAdmin = "CREATE TABLE IF NOT EXISTS admin(" +
      "id INT NOT NULL AUTO_INCREMENT," +
      "PRIMARY KEY(id)," +
      "user VARCHAR(30) NOT NULL," +
      "pass VARCHAR(30) NOT NULL" +
      ");";
    database.query(configUsuarios, function( err ) {
      if(err){
        console.log(err);
        throw err;
      }else{
        console.log('TABLE usuarios successful');
      }
    });
    database.query(configAdmin, function( err ) {
      if(err){
        console.log(err);
        throw err;
      }else{
        console.log('TABLE admin successful');
      }
    });
    var checkAdmin = 'SELECT user FROM admin where user = "Administrador";';
    database.query(checkAdmin, function(err, rows){
      console.log(rows);
      if(!(rows.length > 0)){
        var query = "INSERT INTO admin(user, pass) VALUES('Administrador','Password');";
        database.query(query, function(err, rows){
          if(err){
            console.log(err);
            throw err;
          }
        });
      }
      console.log("Administrador creado")
    });
  }
}
    

module.exports = database;
