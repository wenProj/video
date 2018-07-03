let request = require('request');
let iconv = require('iconv-lite');
var cheerio = require("cheerio");

//读取ip日志
const run = async ()=> {
  let arr = ['192.168.1.132','120.79.58.203','116.226.24.173','119.23.213.204','54.254.147.226','120.77.176.146','211.103.147.6','120.77.157.237','116.226.24.183'];
  for(let i in arr){
    // console.log(arr[i]);
    await new Promise((resolve)=> {
      //同步处理
      let url = 'http://www.ip138.com/ips1388.asp?ip='+arr[i]+'&action=2';
      //请求头
      let headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
      }

      let options = {
        url: url,
        encoding: null,
        headers: headers
      }

      //发送请求
      request(options, (err, res, body)=> {
        //解决乱码
        let html = iconv.decode(body, 'gb2312');
      
        //分析网页数据
        let $ = cheerio.load(html);
        let lis = $("ul.ul1 li");
      
        //入库信息-地区
        let temp = lis.first().text();
        let area = temp.split(" ")[0].replace("本站数据：","")
        console.log(area+i);
      
        //遍历详细信息
        let detail = "";
        lis.each( (i)=> {
          detail += lis.eq(i).text() + "-------";
        });
        
        //记录到数据库...
        console.log(detail);

        //执行下一个
        resolve();
      });
      
      // setTimeout(()=>{resolve();},3000);//3秒
    })
  }
}

run();

