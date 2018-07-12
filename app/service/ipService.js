const mysql = require('mysql');
const config =  require(`../../config/mysql_test.js`);

let getdata = async data => {//data请求参数
    //创建mysql连接
    var connection = mysql.createConnection({
        host : config.host,
        user : config.user,
        password : config.password,
        database : config.database
    });
    connection.connect();

    let res = { 
        data: '',
        access_count_sum: ''
    };

    //所有记录
    let datas = new Array();
    await new Promise(async (carryon1)=> {
        //记录到数据库
        connection.query(`SELECT area_country,area_province,area_city,access_count,last_access_ip,update_time,log_date FROM area_ip WHERE 1=1 ORDER BY access_count DESC`, (error, results, fields)=> {
            if (error) {
                console.log(`数据库查询出错:${error}`);
                // throw error;
            };
            if(results.length > 0){
                for(let i in results){
                    datas.push(results[i]);
                }
                res.data = datas;
                
                //查询总记录数
                connection.query(`SELECT sum(access_count) as access_count_sum FROM area_ip WHERE 1=1`, (error, results, fields)=> {
                    if (error) {
                        console.log(`数据库查询出错:${error}`);
                        // throw error;
                    };
                    if(results.length > 0){
                        res.access_count_sum = results[0].access_count_sum;
                        //放行
                        carryon1();
                    }
                });
            }
        });

    });
    
    connection.end();
    return res;
}

module.exports={
    getdata:getdata
}