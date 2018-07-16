const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const fs = require("fs");
var readline = require('readline');
var mysql = require('mysql');
const config =  require(`../config/mysql_test.js`);
const {promisify} = require('util');
const postPromise = promisify(request.post);

// let headers = {  
//   'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
// }
// function request (url, callback) {  
//   let options = {
//     url: url,
//     encoding: null,
//     headers: headers
//   }
//   originRequest(options, callback)
// }

// //
// let url = 'http://tiyu.baidu.com/player?id=b285f6fd4bd1c72a733b837195367053&tab=%E6%95%B0%E6%8D%AE&from=baidu_aladdin';
// request(url, async (err, res, body) => {
//     let html = iconv.decode(body, 'utf8');
//     console.log(html);

//     //分析网页数据
//     let $ = cheerio.load(html);
//     let lis = $("ul.ul1 li");

//     //入库信息-地区
//     let temp = lis.first().text();
//     let area = temp.split(" ")[0].replace("本站数据：","");

//     //拆分 省/自治区/直辖市 ---- 市/区
//     // console.log(`原始未拆分:${area}`);
//     let sheng = area.indexOf("省");
//     let qu = area.indexOf("自治区");
//     let shi = area.indexOf("市");

// });




//------------------------测试--------------------------
const api_taobao = async (ip)=> {
  let url = "http://ip.taobao.com/service/getIpInfo2.php";
  const ret = await postPromise({url:url,form:{ip:ip}});

  let param = {
    "area_country":"",
    "let area_province":"",
    "area_city":"",
  };
  //解析响应json
  if(ret != undefined && ret.body != undefined && ret.body != ""){
    let body = JSON.parse(ret.body)
    
    console.log(JSON.stringify(body))

    if(body.code == '0'){
      let data = body.data;
      //省/市/区
      if(data.country != ""){
        param.area_country = data.country;
      }else{
        param.area_country = data.area;
      }
      param.area_province = data.region;
      param.area_city = data.city;
    }
  }
  console.log(param.area_country);
  console.log(param.area_province);
  console.log(param.area_city);
}

api_taobao('223.74.136.121');

