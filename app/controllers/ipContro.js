const ipService = require('../service/ipService');

let getdata = async ctx => {
    // const cup = ctx.body;//根据球队名称筛选
    return await ipService.getdata();
}

module.exports={
    getdata:getdata
}