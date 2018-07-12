const Koa = require('koa');
const route = require('koa-route');
const path = require('path');
const staticmodule = require('koa-static');
const fs = require("fs");
const app = new Koa();
//查询数据库
const cupController = require('./app/controllers/worldcupContro');
const ipContro = require('./app/controllers/ipContro');

//获取世界杯数据
const data = async ctx => {
  getIp(ctx.request);
  let data = await cupController.getdata(ctx.request);
  ctx.response.type = 'json';
  ctx.response.body = { data: data};
}

//获取大强小强ip数据
const ip = async ctx => {
  getIp(ctx.request);
  let data = await ipContro.getdata(ctx.request);
  ctx.response.type = 'json';
  ctx.response.body = data;
}

//static静态资源 html  js  css等
const static = staticmodule(path.join(__dirname));

//首页页面
const index = ctx => {
  getIp(ctx.request);
  //访问根目录 直接跳转到list.html
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./list.html','utf8');
}

//获取ip
var getIp = function(req) {
  var ip = req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress || '';
   
  ip = ip.replace(eval('/:/g'),'').replace(eval('/f/g'),'')// /转译 /g 标识为全部 
  // return ip;
  console.log("客户端ip-----------:"+ip);
};


//注意app.use的顺序
app.use(route.get('/wcdata',data));
app.use(route.get('/ip',ip));
app.use(route.get('/',index));
app.use(static);
app.listen(8083);//5205