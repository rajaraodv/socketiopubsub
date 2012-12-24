
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set("transports", ["xhr-polling"]);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

    /*
     Use cookieParser and session middlewares together.
     By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
     make sure to use cookie name 'jsessionid' (instead of connect.sid) to use Cloud Foundry's 'Sticky Session' feature.
     W/o this, Socket.io won't work if you have more than 1 instance.
     PS: If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.
     */
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({key:'jsessionid', secret: 'your secret here'}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

io.sockets.on('connection', function(socket) {
    socket.on('chat', function(data){
        var msg = JSON.parse(data);
        var reply = JSON.stringify({action: 'message', user: msg.user, msg: msg.msg });
        socket.emit('chat', reply);
        socket.broadcast.emit('chat', reply);
    });

    socket.on('join', function(data){
        var msg = JSON.parse(data);
        var reply = JSON.stringify({action: 'control', user: msg.user, msg: ' joined the channel' });
        socket.emit('chat', reply);
        socket.broadcast.emit('chat', reply);

    });

});
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
