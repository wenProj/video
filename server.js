var express = require('express');
var app = express();
app.use(express.static('static')); //存放静态文件目录

app.get('/index', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})
 
 app.get('/list', function (req, res) {
   res.sendFile( __dirname + "/" + "list.html" );
})

var server = app.listen(8081, () => {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})