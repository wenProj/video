const originRequest = require('request');
const iconv = require('iconv-lite');
const fs = require("fs");
var readline = require('readline');
var mysql = require('mysql');

//输出日志
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const logFormat = printf(log => {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    return `${time} [${log.label}] ${log.level}: ${log.message}`
});
require('winston-daily-rotate-file');
const logOutputConfig = [new transports.Console(), new transports.DailyRotateFile({
  name:'info-file',
  filename:'C:/Users/test03/Desktop/area_ip_log/ipLonLat',
  datePattern: 'YYYY-MM-DD',
  level:'info',
  maxFiles: '14d'
})];

const logger = createLogger({
  level: 'debug',
  format: combine(
      label({ label: "ip_lonlat" }),
      timestamp(),
      logFormat
  ),
  transports: logOutputConfig
})

//格式化日期
Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "H+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

const run = async()=> {
    let begin = new Date();
    //创建mysql连接
    var connection = mysql.createConnection({
      host : 'universe.cluster-ro-c0sdt8ew9eze.ap-southeast-1.rds.amazonaws.com',
      user : 'dqpay',
      password : 'kVmffV&p',
      database : 'ipLonLat'
    });
    connection.connect();

    //读取日志目录下的所有日志文件
    let arrLogName = new Array();//用于放日志文件名
    let path = "C:\\Users\\test03\\Desktop\\log\\";
    //读取完所有日志后，才执行遍历每个日志
    await new Promise((carryon3)=> {
      fs.readdir(path,(err,files)=>{
        if(err){
          logger.log("info","读取日志目录出错...")
          console.log("读取日志目录出错...")
        }else{
          //添加到arr
          files.forEach((filename) =>{
            arrLogName.push(filename);
          });
          carryon3();
        }
      });
    });

    //拿到每个日志文件
    for(let i in arrLogName){
      //当每个日志文件读取完后，在读取下一个
      await new Promise(async (carryon4)=> {
        let filename = arrLogName[i];
        logger.log("info","-------------------日志文件------------"+filename);
        console.log("-------------------日志文件------------"+filename);
        //提取日志文件日期
        let logdate = filename.trim().replace("latitude_longitude.log.","");
        //查询log_date 最新日期，避免重复跑日志文件

        let flag = false;
        await new Promise((carryon5)=> {
          connection.query('SELECT log_date FROM ip_lonlat WHERE 1=1 ORDER BY log_date DESC limit 1', function (error, results, fields) {
            if (error) {
              logger.log("info",`数据库查询日志日期出错:${error}`);
              console.log(`数据库查询日志日期出错:${error}`);
              carryon5();
            };
            if(results.length == 1){
              if(new Date(logdate) > new Date(results[0].log_date.Format("yyyy-MM-dd"))){//例:时间2018-07-06  转Date后，会比2018-7-6 转Date后 多8个小时,所以这里要转为相同格式，再比较
                flag = true;
                carryon5();
              }else{
                flag = false;
                carryon5();
              }
            }else{
              //数据库无记录，此时全部日志新增
              flag = true;
              carryon5();
            }
          });
        });

        if(flag){
          //读取每个ip日志文件
          let arr = new Array();//用于放ip
          let distinctObj = {};//用于存放去重ip
          var readerStream = fs.createReadStream(path+filename);
          // 设置编码为 utf8。
          readerStream.setEncoding('UTF8');
          //全部读取到 arr中后，才执行抓取
          await new Promise((carryon1)=> {
            var objReadline = readline.createInterface({
              input: readerStream,
              terminal: true
            });

            // 读取每一行，push到arr
            var index = 1;
            objReadline.on('line', (line)=>{
              // console.log(`行数:${index}`, `ip:${line}`);
              // 添加到数组-空行不添加
              if(line != undefined && line.length > 0){
                arr.push(line);

                if(!distinctObj[line]){
                  distinctObj[line] = 1;
                }else{
                  distinctObj[line] += 1;
                }

              }
              index ++;
            });

            objReadline.on('close',function(){
              logger.log("info","-------------------读取完毕");
              console.log("-------------------读取完毕");
              //继续执行
              carryon1();
            });
            //读取错误
            objReadline.on('error', function(err){
                console.log(err.stack);
            });
          });

          //遍历ip数组
          logger.log("info",`ip数组长度:${arr.length}`);
          console.log(`ip数组长度:${arr.length}`);

          var a = 0;
          for (var key in distinctObj) {
            if (distinctObj.hasOwnProperty(key)) a++;
          }
          logger.log("info",`ip数组去重后长度:${a}`);
          console.log(`ip数组重后长度:${a}`);

          let des = "";
          let accessCountFromDistinctObj = 1;//去重后的 计数
          for (var key1 in distinctObj) {
            let ip = key1.trim();//去除空格
            accessCountFromDistinctObj = distinctObj[key1];//重复计数  记录到access_count

            //处理ip
            var member_id = "";
            var lon = "";
            var lat = "";
        
            var arrs = ip.split(",");
            if(arrs != undefined && arrs.length == 4){
              
              member_id = arrs[0];//会员号
              //经纬度校验
              lon =  arrs[1];
              if(!(lon >=-180 && lon <= 180) || lon == '0'){
                des = des + "经度错误,";
              }
              lat =  arrs[2];
              if(!(lat >=-90 && lat <= 90) || lat == '0'){
                des = des + "纬度错误,";
              }
              ip = arrs[3];

            }else{
              ip = "";
            }


            logger.log("info",`ip:${key1}`);
            console.log(`ip:${key1}`);
            
            if(member_id != ""){
              // var temp = 1;
              await new Promise(async (carryon2)=> {
                // temp++;              
                try {
                  let area = "";
                  let area_latlon = "";
                  let area_country = "";
                  let area_province = "";
                  let area_city = "";
              
                  let arrs2 = ip.split(".");
                  if(arrs2 != undefined && arrs2.length == 4 && ip != "127.0.0.1"){
                    // let url = 'https://ip.cn/index.php?ip='+ip;
                    let url = 'http://whois.pconline.com.cn/ip.jsp?ip='+ip;
                    //let url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=false';//纬度,经度
                    let latlonUrl = 'https://apis.map.qq.com/jsapi?qt=rgeoc&lnglat='+lon+'%2C'+lat+'&key=FBOBZ-VODWU-C7SVF-B2BDI-UK3JE-YBFUS&output=jsonp&pf=jsapi&ref=jsapi&cb=qq.maps._svcb3.geocoder0'
                
                    if(des.indexOf("IP") <= 0){
                      await new Promise(async (carryon7)=> {
                        let headers = {
                          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
                          'Accept-Language': 'zh-CN,zh;'
                        }
                        const request = (url, callback)=> {
                          let options = {
                            url: url,
                            encoding: null,
                            headers: headers
                          }
                          originRequest(options, callback);
                        }
                    
                        request(url, async (err, res, body) => {
                          if(body != undefined){
                            let html = iconv.decode(body, 'gbk').trim();
                              area = html.split(" ")[0];
                              if(area != undefined && area != ""){
                                carryon7();
                              }else{
                                carryon7();
                              }
                            }else{
                              carryon7();
                            }
                        });

                        // if(temp == 1){
                        //   setTimeout(()=>{console.log("抓取IP阻塞，等待10秒执行........................................");
                        //   carryon7()},10000);//10秒
                        // }

                      });                    
                    }

                    //经纬度统计
                    if(des.indexOf("度") <= 0){
                      await new Promise(async (carryon8)=> {
                        let headers = {
                          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
                          'Accept-Language': 'zh-CN,zh;'
                        }
                        const request = (latlonUrl, callback)=> {
                          let options = {
                            url: latlonUrl,
                            encoding: null,
                            headers: headers
                          }
                          originRequest(options, callback);
                        }
                    
                        request(latlonUrl, async (err, res, body) => {
                          if(body != undefined){
                            let json = iconv.decode(body, 'gbk');
                            json = JSON.parse(json.replace("qq.maps._svcb3.geocoder0&&qq.maps._svcb3.geocoder0(","").replace("})","}"));
                            if(json.detail.poilist != undefined){
                              let results = json.detail.poilist;
                              if(results.length > 0){
                                area_country = results[0].addr
                              }
                            }
                            carryon8();
                          }else{
                            carryon8();
                          }
                        });
                        
                        // if(temp == 1){
                        //   setTimeout(()=>{console.log("抓取经纬度阻塞，等待10秒执行........................................");
                        //   carryon8()},10000);//10秒
                        // }

                      });
                    }

              
                  }else{
                    des = des + "IP错误";
                  }
                  if(des == ""){
                    des = "成功";
                  }
              
                  //记录到数据库
                  //新增记录access_count=accessCountFromDistinctObj  去重后重复值
                  var  addSql = 'INSERT INTO ip_lonlat(member_id,lon,lat,area_origin,area_country,area_province,area_city,access_count,last_access_ip,update_time,log_date,des) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'; //id自增
                  var  addSqlParams = [member_id,lon,lat,area,area_country,area_province,area_city,accessCountFromDistinctObj,ip,new Date(),logdate,des]; //可接受传递参数++++++++++++++++日志后缀日期
              
                  connection.query(addSql,addSqlParams,function (error, result) {
                    if(error){
                      console.log(`数据库新增出错:${error}`);
                      // throw error;
                      carryon2();
                    }
              
                    logger.log("info",`新增,该地区记录--area_origin:${area}---member_id:${member_id}---lon:${lon}---lat:${lat}---last_access_ip:${ip}---log_date:${logdate}`);
                    console.log(`新增,该地区记录--area_origin:${area}---member_id:${member_id}---lon:${lon}---lat:${lat}---last_access_ip:${ip}---log_date:${logdate}`);
                    if(result != undefined && result.affectedRows == 1){//插入数据成功
                      //循环下一个ip
                      carryon2();
                    }
                  });
              
                  // console.log('----------------------跑完一条--------------------------');
                  // setTimeout(()=>{carryon2()},3000);//3秒
                } catch (error) {
                  logger.log("info",`------------抓取api报错${error}------------`);
                  console.log(`------------抓取api报错${error}------------`);
                  carryon2();
                }
                // temp--;
              });
            }
            des = "";
            accessCountFromDistinctObj = 1;
          }
        }
        carryon4();
      });
    }
    connection.end(); //关闭连接
    let end = new Date();
    logger.log("info",`总共耗时:${(end-begin)/60000}分钟`);
    console.log(`总共耗时:${(end-begin)/60000}分钟`);
}

run();
