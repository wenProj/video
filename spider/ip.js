const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const fs = require("fs");
var readline = require('readline');
var mysql = require('mysql');
const config =  require(`../config/mysql_test.js`);

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
      console.log("日志文件++++++"+filename);
      //提取日志文件日期
      let logdate = filename.trim().replace("ipLog.log.","");
      //查询log_date 最新日期，避免重复跑日志文件
      
      // let flag = false;
      connection.query('SELECT log_date FROM area_ip WHERE 1=1 ORDER BY log_date DESC limit 1', function (error, results, fields) {
        if (error) {
          console.log(`数据库查询日志日期出错:${error}`);
          return;
        };
        if(results.length == 1){
          if(new Date(logdate) < results[0].log_date){
            carryon4();
          }
          console.log("++++++++++++++"+results[0].log_date);
        }
      });

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
          console.log("读取完毕");
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
        await new Promise((carryon2)=> {
          //调用百度集成的ip查询  ip138
          let url = 'http://www.ip138.com/ips1388.asp?ip='+arr[i]+'&action=2';//备用  http://www.882667.com/ip_114.252.242.46.html
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
          request(options, async (err, res, body)=> {
            //解决乱码
            let html = iconv.decode(body, 'gb2312');
          
            //分析网页数据
            let $ = cheerio.load(html);
            let lis = $("ul.ul1 li");
          
            //入库信息-地区
            let temp = lis.first().text();
            let area = temp.split(" ")[0].replace("本站数据：","");

            //拆分 省/自治区/直辖市 ---- 市/区
            console.log(`原始未拆分:${area}`);
            let sheng = area.indexOf("省");
            let qu = area.indexOf("自治区");
            let shi = area.indexOf("市");
            
            let area_province = "";
            let area_city = "";
            if(sheng != -1){
              area_province = area.substring(0,sheng+1);
              area_city = area.substring(sheng+1);

            }else if(qu != -1){
              area_province = area.substring(0,qu+3);
              area_city = area.substring(qu+3);

            }else if(shi != -1){
              area_province = area.substring(0,shi+1);
              area_city = area.substring(shi+1);

            }else{
              area_province = area;
              area_city = area;
            }
            
            console.log(`省:${area_province}`);
            console.log(`市:${area_city}`);

            //遍历详细信息
            let detail = "";
            lis.each( (i)=> {
              detail += lis.eq(i).text() + "-------";
            });
            console.log(`详细信息:${detail}`);

            //记录到数据库
            connection.query(`SELECT id,area_origin,area_province,area_city,area_count,update_time,log_date FROM area_ip WHERE area_origin='${area}'`, (error, results, fields)=> {
              if (error) {
                console.log(`数据库查询出错:${error}`);
                return;
              };
              if(results.length == 1){
                //修改记录area_count累加
                var updateSql = 'UPDATE area_ip SET area_count = area_count+1,log_date=? WHERE area_origin = ?';
                var updateSqlParams = [logdate,area];
                connection.query(updateSql,updateSqlParams,function (err, result) {
                  if(error){
                    console.log(`数据库修改出错:${error}`);
                    return;
                  }
                  if(result.affectedRows == 1){//修改数据成功
                    //循环下一个ip
                    carryon2();
                  }
                });
              }else if(results.length == 0){
                //新增记录area_count=1
                var  addSql = 'INSERT INTO area_ip(area_origin,area_province,area_city,area_count,update_time,log_date) VALUES(?,?,?,?,?,?)'; //id自增
                var  addSqlParams = [area,area_province,area_city,1,new Date(),logdate]; //可接受传递参数++++++++++++++++日志后缀日期

                connection.query(addSql,addSqlParams,function (error, result) {
                  if(error){
                    console.log(`数据库新增出错:${error}`);
                    return;
                  }
                  if(result.affectedRows == 1){//插入数据成功
                    //循环下一个ip
                    carryon2();
                  }
                });
              }
            });
            
            console.log('------------------------------------------------');
            // setTimeout(()=>{carryon2()},3000);//3秒        
          });
        })
      }
      carryon4();
    });
  }
  connection.end(); //关闭连接
}
run();