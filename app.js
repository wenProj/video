const Koa = require('koa');
const route = require('koa-route');
const path = require('path');
const staticmodule = require('koa-static');
const fs = require("fs");
const app = new Koa();
//数据Service
const cupController = require('./app/controllers/worldcupContro');

//获取数据
const data = async ctx => {
  let data = await cupController.getdata(ctx.request);
  ctx.response.type = 'json';
  ctx.response.body = { data: data};
}

//static静态资源 html  js  css等
const static = staticmodule(path.join(__dirname));

//首页页面
const index = ctx => {
  //访问根目录 直接跳转到list.html
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./list.html','utf8');
}

//注意app.use的顺序
app.use(route.get('/wcdata',data));
app.use(route.get('/',index));
app.use(static);
app.listen(5205);