let request = require('request');
const {promisify} = require('util');
const getPromise = promisify(request.get);
let iconv = require('iconv-lite');
var cheerio = require("cheerio");

//请求头
let headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

//异步的发送请求
const requestMethod = async function(url, callback) {
  let options = {
    url: url,
    encoding: null,
    headers: headers
  }
  await request(options, callback)
}

  // 根据ip抓取地区
function run(ip){
  let url = 'http://www.ip138.com/ips1388.asp?ip='+ip+'&action=2';
  requestMethod(url, function (err, res, body) {
      //解决乱码
      let html = iconv.decode(body, 'gb2312');

      //分析网页数据
      let $ = cheerio.load(html);
      let lis = $("ul.ul1 li");

      //入库信息-地区
      let temp = lis.first().text();
      let area = temp.split(" ")[0].replace("本站数据：","")
      console.log(area);

      //遍历详细信息
      let detail = "";
      lis.each(function(i, e){
        detail += lis.eq(i).text() + "-------";
      });
      console.log(detail);
  })
}

let arr = ['120.79.58.203','116.226.24.173','119.23.213.204','54.254.147.226','120.77.176.146','211.103.147.6','120.77.157.237','192.168.1.132','116.226.24.183'];
for(let i in arr){
  // console.log(arr[i]);
  run(arr[i]);
}



const run1 = async function(){
  const ret = await getPromise("http://www.ip138.com/ips1388.asp?ip=119.23.213.204&action=2");
  console.log(ret);
}

// run1();


