const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const fs = require("fs");
var readline = require('readline');
var mysql = require('mysql');
const config =  require(`../config/mysql_test.js`);
const {promisify} = require('util');
const postPromise = promisify(request.post);

//时间转为字符串 yyyy-MM-dd
let dateToString = function(d){
  let date = "";
  try {
    date = (d.getFullYear()) + "-0" +
    (d.getMonth() + 1) + "-0" +
    (d.getDate());
  } catch (error) {
    console.log(`转换日期出错:${error}`)
  }
  return date;
}

const run = async()=> {

    //创建mysql连接
    var connection = mysql.createConnection({
      host : config.host,
      user : config.user,
      password : config.password,
      database : config.database
    });
    connection.connect();

    //读取日志目录下的所有日志文件
    let arrLogName = new Array();//用于放日志文件名
    let path = "C:\\Users\\test03\\Desktop\\log\\";
    //读取完所有日志后，才执行遍历每个日志
    await new Promise((carryon3)=> {
      fs.readdir(path,(err,files)=>{
        if(err){
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
        console.log("-------------------日志文件------------"+filename);
        //提取日志文件日期
        let logdate = filename.trim().replace("ipLog.log.","");
        //查询log_date 最新日期，避免重复跑日志文件

        let flag = false;
        await new Promise((carryon5)=> {
          connection.query('SELECT log_date FROM area_ip WHERE 1=1 ORDER BY log_date DESC limit 1', function (error, results, fields) {
            if (error) {
              console.log(`数据库查询日志日期出错:${error}`);
              carryon5();
            };
            if(results.length == 1){
              // console.log(new Date('2018-07-05').getTime());
              // console.log(new Date('2018-7-5').getTime());
              // console.log(new Date(logdate)-results[0].log_date);

              if(new Date(logdate) > new Date(dateToString(results[0].log_date))){//例:时间2018-07-06  转Date后，会比2018-7-6 转Date后 多8个小时,所以这里要转为相同格式，再比较
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
              }
              index ++;
            });

            objReadline.on('close',function(){
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
          console.log(`ip数组长度:${arr.length}`);
          for(let i in arr){
            console.log(`ip:${arr[i]}`);
            await new Promise(async (carryon2)=> {
              try {
                let url = "http://ip.taobao.com/service/getIpInfo2.php";
                const ret = await postPromise({url:url,form:{ip:arr[i]}});
              
                let area_country = "";
                let area_province = "";
                let area_city = "";
                //解析响应json
                if(ret != undefined && ret.body != undefined && ret.body != ""){
                  let body = JSON.parse(ret.body)
                  if(body.code == '0'){
                    let data = body.data;
                    //省/市/区
                    if(data.country != ""){
                      area_country = data.country;
                    }else{
                      area_country = data.area;
                    }
                    area_province = data.region;
                    area_city = data.city;
                  }
                }
                //地区未拆分，用于area_origin和查询条件
                let area = area_country+area_province+area_city;
  
                  //记录到数据库
                  connection.query(`SELECT id,area_country,area_province,area_city,access_count,update_time,log_date FROM area_ip WHERE area_origin='${area}'`, (error, results, fields)=> {
                    if (error) {
                      console.log(`数据库查询出错:${error}`);
                      // throw error;
                    };
                    if(results.length == 1){
                      //修改记录access_count累加
                      var updateSql = 'UPDATE area_ip SET access_count = access_count+1,log_date=?,last_access_ip=? WHERE area_origin = ?';
                      var updateSqlParams = [logdate,arr[i],area];
                      connection.query(updateSql,updateSqlParams,function (error, result) {
                        if(error){
                          console.log(`数据库修改出错:${error}`);
                          // throw error;
                        }
                        console.log(`修改,访问量累加---area_country:${area_country}---area_province:${area_province}---area_city:${area_city}---last_access_ip:${arr[i]}---log_date:${logdate}`)
                        if(result != undefined && result.affectedRows == 1){//修改数据成功
                          //循环下一个ip
                          carryon2();
                        }
                      });
                    }else if(results.length == 0){
                      //新增记录access_count=1
                      var  addSql = 'INSERT INTO area_ip(area_origin,area_country,area_province,area_city,access_count,last_access_ip,update_time,log_date) VALUES(?,?,?,?,?,?,?,?)'; //id自增
                      var  addSqlParams = [area,area_country,area_province,area_city,1,arr[i],new Date(),logdate]; //可接受传递参数++++++++++++++++日志后缀日期
  
                      connection.query(addSql,addSqlParams,function (error, result) {
                        if(error){
                          console.log(`数据库新增出错:${error}`);
                          // throw error;
                        }
                        console.log(`新增,该地区记录---area_country:${area_country}---area_province:${area_province}---area_city:${area_city}---last_access_ip:${arr[i]}---log_date:${logdate}`)
                        if(result != undefined && result.affectedRows == 1){//插入数据成功
                          //循环下一个ip
                          carryon2();
                        }
                      });
                    }
                  });
  
                  // console.log('----------------------跑完一条--------------------------');
                  // setTimeout(()=>{carryon2()},3000);//3秒
              } catch (error) {
                console.log(`抓取api报错${error}------继续抓取下一个....`);
                carryon2();
              }
            });
          }
        }
        carryon4();
      });
    }
    connection.end(); //关闭连接
}

run();
