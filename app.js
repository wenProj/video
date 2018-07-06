const Koa = require('koa');
const route = require('koa-route');
const path = require('path');
const serve = require('koa-static');
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

//static静态资源
const static = serve(path.join(__dirname+"/static/move"));

//页面
const html = ctx => {
  console.log("访问路径"+ctx.request.path);
  if(ctx.request.path !== "/"){
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./'+ctx.request.path,'utf8');
  }else{
    //访问根目录 直接跳转到list.html
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./list.html','utf8');
  }
}

app.use(route.get('/wcdata',data));
// app.use(static);//注意app.use的顺序
app.use(html);
app.listen(5205);