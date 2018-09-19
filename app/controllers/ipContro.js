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
    let param = ctx.query;
    console.log(param);

    return await ipService.getdata(param);
}

let getExcel = async ctx => {
    let param = ctx.query;
    const result = await ipService.getdata(param);
    let data = [["序号", "会员号", "经度", "纬度", "ip查询地区", "经纬度查询详细地址", "访问量", "该地区示例IP","描述","日志日期","更新时间","","总访问量"]],
        fileName = "DQIP." + new Date().Format("yyyy-MM-dd"),
        filePath = "C:\\Users\\test03\\Desktop\\" + fileName + ".xlsx";
    //修改文件名日期为前一天
    if(result.data.length != 0 && result.data[0].log_date != undefined){
        data.fileName = "DQIP." + result.data[0].log_date.Format("yyyy-MM-dd");
    }
    let datas = result.data;
    for (let i = 0; i < datas.length; i++) {
        let ipExcel = [];
        ipExcel.push(i+1);
        ipExcel.push(datas[i].member_id);
        ipExcel.push(datas[i].lon);
        ipExcel.push(datas[i].lat);
        ipExcel.push(datas[i].area_origin);
        ipExcel.push(datas[i].area_country);
        ipExcel.push(datas[i].sum);
        ipExcel.push(datas[i].last_access_ip);
        ipExcel.push(datas[i].des);
        ipExcel.push(datas[i].log_date.Format("yyyy-MM-dd"));
        ipExcel.push(datas[i].update_time.Format("yyyy-MM-dd HH:mm:ss"));
        //添加总访问量
        if(i == 0){
            ipExcel.push('');
            ipExcel.push(result.access_count_sum);
        }
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