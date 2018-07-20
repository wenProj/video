const xlsx = require("node-xlsx");
const fs = require("fs");
const ipService = require('../service/ipService');

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

let getdata = async ctx => {
    // const cup = ctx.body;//根据球队名称筛选
    return await ipService.getdata();
}

let getExcel = async ctx => {
    const result = (await ipService.getdata()).data;
    let data = [["序号", "国家", "省份", "城市", "访问量", "该地区最后一个访问IP", "更新时间", "日志日期"]],
        fileName = "DQIP." + new Date().Format("yyyy-MM-dd"),
        filePath = "C:\\Users\\test03\\Desktop\\" + fileName + ".xlsx";
    for (let i = 0; i < result.length; i++) {
        let ipExcel = [];
        ipExcel.push(i+1);
        ipExcel.push(result[i].area_country);
        ipExcel.push(result[i].area_province);
        ipExcel.push(result[i].area_city);
        ipExcel.push(result[i].access_count);
        ipExcel.push(result[i].last_access_ip);
        ipExcel.push(result[i].update_time.Format("yyyy-MM-dd HH:mm:ss"));
        ipExcel.push(result[i].log_date.Format("yyyy-MM-dd"));
        data.push(ipExcel);
    }
    let buffer = xlsx.build([{ name: fileName, data: data }]);
    fs.writeFileSync(filePath, buffer, "binary");
    let res = { fileName: filePath};
    return res;
};

module.exports={
    getdata: getdata,
    getExcel: getExcel
}