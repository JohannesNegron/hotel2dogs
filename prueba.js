/*var helper = require('sendgrid').mail;
var from_email = new helper.Email('dayry@gmail.com');
var to_email = new helper.Email('juseng7@gmail.com');
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content('text/plain', 'Hello, Email!');
var mail = new helper.Mail(from_email, subject, to_email, content);*/
//var sg   = require( 'sendgrid' )("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");
var sg   = require( 'sendgrid' )("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");
sg.send({
      to:       'juseng7@gmail.com',
      from:     'noreply@proximasolutions.com',
      subject:  'Alerta Proxima',
      text:     'Esta teniendo un exceso en el consumo de'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });