const mysql = require('mysql');
const config =  require(`../../config/mysql_test.js`);
const areaIp = require('../models/areaIp')
var sequelize = require('sequelize');
const moment = require('moment');
//统一返回值
let res = { 
    data: '',
    access_count_sum: ''
};

let getdata = async data => {//data请求参数
    //创建mysql连接
    var connection = mysql.createConnection({
        host : config.host,
        user : config.user,
        password : config.password,
        database : config.database
    });
    connection.connect();

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

//使用sequelize框架
let getdata2 = async param=>{
    if(param.log_date == undefined){
        param.log_date = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }
    const condition = {
        attributes: ['id','member_id','lon','lat','area_origin','area_country',[sequelize.fn('SUM', sequelize.col('access_count')), 'sum'],'last_access_ip','update_time','log_date','des'],
        where: {log_date: param.log_date + ' 00:00:00'},
        order: [[sequelize.fn('SUM', sequelize.col('access_count')), 'DESC']],
        group: ['member_id','lon','lat','area_origin','area_country','des']
    };
    //添加条件
    if(param.des != "" && param.des != undefined){
        condition.where.des = param.des;
    }
    if(param.area_origin == ""){
        condition.where.area_origin = param.area_origin;
    }
    if(param.area_country == ""){
        condition.where.area_country = param.area_country;
    }

    let datas = await areaIp.db().findAll(condition);
    res.data = datas;
    //计算总访问量
    let totalSum = 0;
    datas.forEach(e => {
        e = JSON.parse(JSON.stringify(e));
        totalSum = totalSum + Number(e.sum);
    });
    res.access_count_sum = totalSum;

    return res;
};

module.exports={
    getdata:getdata2
}