const cupService = require('../service/worldcupService');

let getdata = async ctx => {
    // const cup = ctx.body;//根据球队名称筛选
    return await cupService.getdata({
        // teamname: cup.teamname
    });
}

module.exports={
    getdata:getdata
}