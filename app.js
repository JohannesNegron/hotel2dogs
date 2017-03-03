var port = 80;

var sendgrid     = require( 'sendgrid' )("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");
var http         = require('http');
var express      = require('express');
var request      = require("request");
var path         = require('path');
var app          = express();
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var io           = require('socket.io')(app.listen(port));
var mysql        = require( 'mysql' );

var admin = require('./routes/admin');
var user = require('./routes/user');

var database = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'hotel'
});

var configUsuarios = "CREATE TABLE IF NOT EXISTS usuarios(" +
  "id INT NOT NULL AUTO_INCREMENT," +
  "PRIMARY KEY(id)," +
  "firstname VARCHAR(30) NOT NULL," +
  "lastname VARCHAR(30) NOT NULL," +
  "correo VARCHAR(30) NOT NULL," +
  "contraseña VARCHAR(30) NOT NULL," +
  "checkin DATETIME," + 
  "checkout DATETIME,"+
  "room VARCHAR(30),"+
  "pets JSON"+
  ");";
var configAdmin = "CREATE TABLE IF NOT EXISTS admin(" +
  "id INT NOT NULL AUTO_INCREMENT," +
  "PRIMARY KEY(id)," +
  "user VARCHAR(30) NOT NULL," +
  "pass VARCHAR(30) NOT NULL" +
  ");";
var configPets = "CREATE TABLE IF NOT EXISTS pets(" +
  "id INT NOT NULL AUTO_INCREMENT," +
  "PRIMARY KEY(id)," +
  "mail VARCHAR(30) NOT NULL," +
  "pets VARCHAR(30) NOT NULL" +
  ");";
var configRooms = "CREATE TABLE IF NOT EXISTS rooms(" +
  "id INT NOT NULL AUTO_INCREMENT," +
  "PRIMARY KEY(id)," +
  "name VARCHAR(20) NOT NULL," +
  "url VARCHAR(50) NOT NULL," +
  "port VARCHAR(6) NOT NULL," +
  "user VARCHAR(20) NOT NULL," +
  "pass VARCHAR(20) NOT NULL," +
  "available BOOLEAN NOT NULL" +
  ");";
database.query(configRooms, function( err ) {
  if(err){
    console.log(err);
    throw err;
  }else{
    console.log('TABLE rooms successful');
  }
});
database.query(configPets, function( err ) {
  if(err){
    console.log(err);
    throw err;
  }else{
    console.log('TABLE pets successful');
  }
});
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
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'jade');
startTime();
function deleteCheckOut(time){
  var query = "SELECT room FROM usuarios where checkout >= '"+time+"';";
  //console.log(query);
  database.query(query, function(err, rows){
    if(err){
      throw err;
    }else{
      var rooms = JSON.stringify(rows);//[0]['pass'];  
      for(var i in JSON.parse(rooms)){
        console.log(i);
        var query2 = "update rooms set available = true where name = '"+JSON.parse(rooms)[i]["room"]+"';";
        //console.log(query2);
        database.query(query2, function(err){
          if(err){
            throw err;
          }else{
            var query3 = "DELETE from usuarios where checkout >= '"+time+"';";  
            //console.log(query3);
            database.query(query3, function(err){
              //console.log(err);
              if(err){
                throw err;
              }
            });
          }     
        });
      }
    }
  });
}
setInterval(startTime, 1000);
function startTime() {
    var today = new Date();
    var d = today.getDate();
    var mes = today.getMonth();
    var year = today.getFullYear();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    var time = year +"-"+mes+"-"+d+" "+h + ":" + m + ":" + s;
    console.log(time);
    //deleteCheckOut("2017-02-08 12:0:0");
    if(h >= 12 && m == 0 && s == 0){
      deleteCheckOut(time);
    }
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
app.use('/modules', express.static( path.join( __dirname, 'node_modules' ) ) );
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: '123456', resave: true, saveUninitialized: true}));
app.get('/Adminlogout', function(req, res) {
  req.session.destroy();
  res.redirect('/admin/#/');
});
app.get('/Userlogout', function(req, res) {
  req.session.destroy();
  res.redirect('/user/#/');
});
app.use('/admin', admin );
app.use('/user', user);
app.post('/logUSER', function(req, res){
  var query = 'SELECT * FROM usuarios where correo = "'+req.body.user+'";';
  console.log(query);
  database.query(query, function(err, rows){
    var pass = JSON.parse(JSON.stringify(rows))[0]['contraseña'];
    if(pass == req.body.pass){
      req.session.data = JSON.stringify(rows);
      req.session.user = true;
      req.session.name = JSON.parse(JSON.stringify(rows))[0]['firstname'] + " " + JSON.parse(JSON.stringify(rows))[0]['lastname'];;
    }
    res.redirect('/user/#/');
  });  
});
app.post('/login', function(req, res){
  var query = 'SELECT pass FROM admin where user = "Administrador";';
  database.query(query, function(err, rows){
    var pass = JSON.parse(JSON.stringify(rows))[0]['pass'];
    if((pass == req.body.pass) && (req.body.user == "Administrador")){
      req.session.admin = true;
    }
    res.redirect('/admin/#/');
  });  
});
app.post('/getUser', function(req, res){
  var room = JSON.parse(req.session.data)[0]['room'];
  var query = "SELECT * FROM rooms where name= '"+room+"';";
  console.log(query);
  database.query(query, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
      var data = JSON.stringify(rows);
      res.write(data);
      res.end();
    }
  });
});
app.post('/getData', function(req, res){
  var query = "SELECT * FROM usuarios";
  database.query(query, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
      var data = JSON.stringify(rows);
      res.write(data);
      res.end();
    }
  });
});
app.post('/getRooms', function(req, res){
  var query = "SELECT * FROM rooms";
  database.query(query, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
      var data = JSON.stringify(rows);
      res.write(data);
      res.end();
    }
  });
});
app.post('/getRoomsAvailable', function(req, res){
  var query = "SELECT * FROM rooms where available= TRUE";
  database.query(query, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
      var data = JSON.stringify(rows);
      res.write(data);
      res.end();
    }
  });
});
app.get('admin/*',function (req, res) {
  res.redirect('/admin/#/');
});
app.get('/admin/',function (req, res) {
  res.redirect('/admin/#/');
});
app.use(function(req, res){
  res.send(404);
});

function genPass(){
  var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ012346789";
  var contraseña = "";
  for (i=0; i<8; i++) contraseña += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
  return contraseña;
}
function timeformat(data){
  var time_checkin = new Date(data);
  var y = time_checkin.getFullYear();
  var m = time_checkin.getMonth()+1;
  var d = time_checkin.getDate();
  var hor = time_checkin.getHours();
  var min = time_checkin.getMinutes();
  var sec = time_checkin.getSeconds();
  m = checkTime(m);
  d = checkTime(d);
  hor = checkTime(hor);
  min = checkTime(min);
  sec = checkTime(sec);
  return y + "-" + m + "-" + d +" "+ hor + ":" + min + ":" + sec;
}
function formatArray(data){
  var sData = data.toString();
  var JSONSQL = sData.replace(/,/g, '","');
  return '["'+JSONSQL+'"]';
    
}
function formats(rows){
  var datos = JSON.parse(JSON.stringify(rows));
  for(var dato in datos){
    console.log(datos);
  }
  return datos;
}
io.sockets.on('connection', function (socket) {
  socket.on('emit:init', function(){
    socket.emit('init');
  });
  socket.on('checkmail', function(data){
    var query = 'SELECT correo FROM usuarios where correo = "'+data.mail+'";';
    database.query(query, function(err, rows){
      console.log(rows);
      if(rows.length>0){
        socket.emit('mail:disavailable');
      }else{
        socket.emit('mail:available', data);
      }
    });
  });
  socket.on('deleteRoom', function(item){
    var query = "DELETE FROM rooms where url = '"+item.url+"' and port = '"+item.port+"';";
    console.log(query);
    database.query(query, function(err){
      if(err){
        console.log(err);
      }else{
        socket.emit('delete:room:success');
      }
    });
  });
  socket.on('checkroom', function(data){
    var query = "select name from rooms where url = '"+data.room+"' and port = '"+data.port+"';";
    database.query(query, function(err, rows){
      console.log(rows);
      if(rows.length>0){
        socket.emit('room:disavailable');
      }else{
        socket.emit('room:available', data);
      }
    });
  });
  socket.on('saveRoom', function(data){
    var query = "INSERT INTO rooms(name, url, port, user, pass, available)"+
    " VALUES('"+
    data.name+"','"+
    data.host+"','"+
    data.port+"','"+
    data.user+"','"+
    data.pass+"',"+
    "TRUE"+
    ");";
    console.log(query);
    database.query(query, function(err){
      if(err) console.log(err);
    });
  });
  socket.on('saveData', function(data){
    console.log(data);
    var pass = genPass();
    
    data.checkin = timeformat(data.checkin);
    data.checkout = timeformat(data.checkout);

    console.log(data.checkout);
    console.log(data.checkin);
    var query = "INSERT INTO usuarios(firstname, lastname, room, correo, checkin, checkout, pets, contraseña)"+
    " VALUES('"+
    data.firstname+"','"+
    data.lastname+"','"+
    data.room+"','"+
    data.mail+"','"+
    data.checkin+"','"+
    data.checkout+"','"+
    formatArray(data.pets)+"','"+
    pass+
    "');";
    var query2= "update rooms SET available = 0 where name = '"+data.room+"';";
    console.log(query);
    database.query(query, function(err){
      if(err) console.log(err);
      database.query(query2, function(err2){
        if(err) console.log(err2);
      });
    });
    sendgrid.send({
      to:       data.mail,
      from:     'noreply@proximasolutions.com',
      subject:  'Envio de contraseña',
      text:     'Gracias por usar nuestro servicio de Cuidados.\n'+
      'Esta es la contraseña que necesita para poder entrar a nuestra aplicacion:\n\n'+pass+'\n\nRecuerde que la contraseña es temporal.\n\nSaludos, el equipo del Hotel'
    }, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
  });
  socket.on('deleteIP', function(data){
    var query = "DELETE FROM usuarios where correo = '"+data.correo+"';";
    var query2= "update rooms SET available = 1 where name = '"+data.room+"';";
    console.log(query);
    database.query(query, function(err){
      if(err){
        console.log(err)
      }else{
        database.query(query2, function(err2){
          socket.emit('delete:success');
        })
      }
    });
  });
});
