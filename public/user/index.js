var socket = io();
(function() {
  var app = angular.module('prolum', ['ngRoute']);
/*********************************************************************CONTROLADOR PRINCIPAL********/
  app.controller('userController', ['$http', '$scope', '$location', function($http, $scope, $location){
    var regis = this;
    regis.user = [];
    regis.url = "";
    initUser();
    function initUser(){
      $http.post('/getUser').success(function(data){
        console.log(data);
        var datos = data[0];
        console.log(datos);
        regis.url = "http://"+datos.url+":"+datos.port+"/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr="+datos.user+"&pwd="+datos.pass+"&";
        document.getElementById("idFrame").src= regis.url;
        console.log(regis.url);
      });
    }
    window.onload = function(){
      setInterval(function(){
        parent.frames['idFrame'].location.href = regis.url;
      }, 1000);
  }
    console.log(regis.user);
  }]);
/*
*********************C O N F I G U R A C I O N*******************************************
************************************ En este apartado se asignan los redireccionamientos*
*****************************************************************************************
*/
  app.config(function($routeProvider){
    $routeProvider
    .when('/', {
      templateUrl : 'user/index.login.jade'
    })
    .when('/login', {
      templateUrl : 'user/login.jade'
    })
    .when('/logout', {
      templateUrl : 'user/logout'
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
