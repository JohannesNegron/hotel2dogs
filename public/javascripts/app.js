var isOn = false;
$(document).ready(function(){
  $('.mdl-spinner.mdl-js-spinner.is-active').show();
  $('#temp').hide();

  var socket = io();
  setInterval(function(){socket.emit('getTemp');},10000); 
      
      
   
  socket.on('datos', function (data) {
    console.log(data);
    $('.mdl-spinner.mdl-js-spinner.is-active').hide();
    $('#temp').show();
    document.getElementById("temp").innerHTML = data.toString()+" °C";
  });

});

