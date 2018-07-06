const originRequest = require('request');
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const mysql = require('mysql');
const config =  require(`../config/mysql_test.js`);

let headers = {  
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}
function request (url, callback) {  
  let options = {
    url: url,
    encoding: null,
    headers: headers
  }
  originRequest(options, callback)
}

//
let url = 'http://tiyu.baidu.com/player?id=b285f6fd4bd1c72a733b837195367053&tab=%E6%95%B0%E6%8D%AE&from=baidu_aladdin';
request(url, async (err, res, body) => {
    let html = iconv.decode(body, 'utf8');
    console.log(html);

    //分析网页数据
    let $ = cheerio.load(html);
    let lis = $("ul.ul1 li");

    //入库信息-地区
    let temp = lis.first().text();
    let area = temp.split(" ")[0].replace("本站数据：","");

    //拆分 省/自治区/直辖市 ---- 市/区
    // console.log(`原始未拆分:${area}`);
    let sheng = area.indexOf("省");
    let qu = area.indexOf("自治区");
    let shi = area.indexOf("市");

});
