const ipService = require('../service/ipService');

exports.getdata = async ctx => {
    // const cup = ctx.body;//根据球队名称筛选
    return await ipService.getdata();
}
