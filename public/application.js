var socket = io();
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
  function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }
(function() {
  var app = angular.module('prolum', ['ngRoute']);
/*********************************************************************CONTROLADOR PRINCIPAL********
***************************************************************************************************
*/
  app.controller('StoreController', ['$http', '$scope', '$interval', function($http,$scope, $interval){
    $scope.delete = function(item){
      console.log(item);
      socket.emit('deleteIP', item.correo);
    }
    socket.on('delete:success', function(){
      initproducts();
    });
    var store = this;
    store.products = [];
    initproducts();
    function initproducts(){
      $http.post('/getData').success(function(datos){
        for(var i = 0; i < datos.length; i++){
          datos[i].checkin = timeformat(datos[i].checkin);
          datos[i].checkout = timeformat(datos[i].checkout);
          datos[i].pets = datos[i].pets.replace(/,/g, "");
          datos[i].pets = datos[i].pets.replace(/"/g, "");
          datos[i].pets = datos[i].pets.replace('[', "");
          datos[i].pets = datos[i].pets.replace(']', "");
          datos[i].pets = datos[i].pets.split(" ");
        }
        console.log(datos);
        store.products = datos;
      });
    }
  }]);
/*
*********************CONTROLADOR PARA AÑADIR ELEMENTO************************************
*/
  app.controller('AddController', ['$http', '$scope', '$location', function($http, $scope, $location){
    $scope.pets = [];
    $scope.addpet = function(pet){
      $scope.pets.push(pet);
      $scope.pet = "";
    };
    $scope.deletepet = function(pet){
      var index = $scope.pets.indexOf(pet);
      console.log(index);
      $scope.pets.splice(index, 1);
    }
    $scope.update = function(user) {
      user.checkin = new Date();
      user.checkout.setHours(12);
      user.pets = $scope.pets;
      console.log(user);
      socket.emit('checkmail', user);
      socket.on('mail:available', function(data){
        socket.emit("saveData", user);
      });
      socket.on('mail:disavailable', function(){
        alert('Correo No disponible');
      });
      $location.path('/');
    }
  }]);
/*
*********************C O N F I G U R A C I O N*******************************************
************************************ En este apartado se asignan los redireccionamientos*
*****************************************************************************************
*/
  app.config(function($routeProvider){
    $routeProvider
    .when('/', {
      templateUrl : 'admin/home.jade',
      controller  : 'StoreController as store'
    })
    .when('/add', {
      templateUrl : 'admin/newBlast.jade',
      controller  : 'AddController'
    })
    .when('/login', {
      templateUrl : 'admin/login.jade'
    })
    .when('/room', {
      templateUrl : 'admin/rooms.jade'
    })
    .when('/logout', {
      templateUrl : 'admin/logout'
    })
    .otherwise('/')
  });
/*
***************************************DIRECTIVAS
*/  
  app.directive("target", function() {
    return {
        restrict : "C",
        templateUrl : 'admin/target.jade'
    };
});
})();
