const mysql = require('mysql');
const config =  require(`../../config/mysql_test`);
const worldCup = require('../models/world_cup')

// let getdata1 = async data => {//data请求参数
//     //创建mysql连接
//     var connection = mysql.createConnection({
//         host : config.host,
//         user : config.user,
//         password : config.password,
//         database : config.database
//     });
//     connection.connect();

//     let datas = new Array();
//     await new Promise(async (carryon1)=> {
//         //记录到数据库
//         connection.query(`SELECT id,match_group,match_name,video_url,match_date,home_team,home_badge,home_goal,away_team,away_badge,away_goal,victory,create_time FROM world_cup WHERE 1=1`, (error, results, fields)=> {
//             if (error) {
//                 console.log(`数据库查询出错:${error}`);
//                 // throw error;
//             };
//             if(results.length > 0){
//                 for(let i in results){
//                     datas.push(results[i]);
//                 }
//                 carryon1();
//             }
//         });
//     });

//     connection.end();
//     return datas;
// }

//使用sequelize框架
let getdata2 = async data=>{
    let datas = await worldCup.db().findAll();
    return datas;
};

module.exports={
    // getdata:getdata1,
    getdata:getdata2
}