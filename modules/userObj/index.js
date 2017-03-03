'use strict';
var user = function(mail){
	this.username = mail;
	this.password = function(){
		var keys = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ012346789";
		var pass = "";
		for (i=0; i<8; i++) pass += keys.charAt(Math.floor(Math.random()*keys.length));
		return pass;
	}
}
module.exports = new user;