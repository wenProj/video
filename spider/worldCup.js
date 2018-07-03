let originRequest = require('request');
let iconv = require('iconv-lite');
var cheerio = require("cheerio");
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

// 抓取腾讯体育-世界杯比赛数据
let url = 'http://matchweb.sports.qq.com/matchUnion/list?startTime=2018-06-14&endTime=2018-07-20&columnId=4&index=0&callback=jQuery111306566127390863624_1530605681640&_=1530605681641';
request(url, function (err, res, body) {
    let html = iconv.decode(body, 'gb2312');
    //截取非json部分
    html = html.replace("jQuery111306566127390863624_1530605681640(","");
    html = html.replace(")","");
    // console.log(html);
    //信息主体
    let data = JSON.parse(html).data
    // console.log(data);
    for(let key in data){
      let date = key;//日期

      let everyday = data[key];//每日数据 array
      // console.log(everyday);
      for(let o in everyday){
        let everyfield = everyday[o];

        let groupNum = everyfield.groupName;// 第几小组
        let matchDesc = everyfield.matchDesc;// 第几轮 例:世界杯A组第3轮
        let videoUrl = everyfield.VURL;//播放地址
        let beginTime = everyfield.startTime//比赛开始时间

        let leftName = everyfield.leftName;//主队
        let leftBadge = everyfield.leftBadge;//主队国旗
        let leftGoal = everyfield.leftGoal;//主队进球

        let rightName = everyfield.rightName;//客队
        let rightBadge = everyfield.rightBadge;//客队国旗
        let rightGoal = everyfield.rightGoal;//客队进球

        console.log(date);
        console.log(groupNum);
        console.log(matchDesc);
        console.log(videoUrl);
        console.log(beginTime);
        console.log(leftName);
        console.log(leftBadge);
        console.log(leftGoal);
        console.log(rightName);
        console.log(rightBadge);
        console.log(rightGoal);
        console.log("---------------------------------------");
      }
    }
    
    
    // var $ = cheerio.load(html)
    // console.log($('h1').text())
    // console.log($('h1').html())
    // console.log(data);
})
