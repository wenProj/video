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

// 抓取腾讯体育-世界杯比赛数据  http://2018.qq.com/
let url = 'http://matchweb.sports.qq.com/matchUnion/list?startTime=2018-06-14&endTime=2018-07-20&columnId=4&index=0&callback=jQuery111306566127390863624_1530605681640&_=1530605681641';
request(url, async (err, res, body) => {
    let html = iconv.decode(body, 'gb2312');
    //截取非json部分
    html = html.replace("jQuery111306566127390863624_1530605681640(","");
    html = html.replace(")","");
    // console.log(html);
    let data = JSON.parse(html).data

    //创建mysql连接
    var connection = mysql.createConnection({
      host : config.host,
      user : config.user,
      password : config.password,
      database : config.database
    });
    connection.connect();
    for(let key in data){

      let date = key;//日期

      let everyday = data[key];//每日数据 array
      // console.log(everyday);
      for(let o in everyday){
        await new Promise((carryon1)=> {
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

          //胜利  0未开赛 1 主队胜  2客队胜 3平
          let victory = '未开赛';
          if(videoUrl != undefined){
            let temp = leftGoal-rightGoal;
            if(temp > 0){
              victory = leftName;
            }else if(temp < 0){
              victory = rightName;
            }else{
              victory = '平';
            }
          }

          console.log(date);
          console.log("---"+groupNum);//match_group
          console.log("+++"+matchDesc);//match_name
          console.log(videoUrl);//video_url
          console.log(beginTime);//match_date
          console.log(leftName);
          console.log(leftBadge);
          console.log(leftGoal);
          console.log(rightName);
          console.log(rightBadge);
          console.log(rightGoal);

          //新增记录access_count=1
          var  addSql = 'INSERT INTO world_cup(match_group,match_name,video_url,match_date,home_team,home_badge,home_goal,away_team,away_badge,away_goal,victory,create_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'; //id自增
          var  addSqlParams = [groupNum,matchDesc,videoUrl,beginTime,leftName,leftBadge,leftGoal,rightName,rightBadge,rightGoal,victory,new Date()]; //可接受传递参数++++++++++++++++日志后缀日期
          connection.query(addSql,addSqlParams,function (error, result) {
            if(error){
              console.log(`数据库新增出错:${error}`);
              // throw error;
            }
            if(result != undefined && result.affectedRows == 1){//插入数据成功
              //循环下一个ip
              console.log("新增数据完成-------");
              // setTimeout(() => {carryon1();}, 3000);
              carryon1();
            }
          });
        });
      }
    }
    connection.end();
})
