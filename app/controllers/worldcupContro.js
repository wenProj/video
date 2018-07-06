const cupService = require('../service/worldcupService');

exports.getdata = async ctx => {
    // const cup = ctx.body;//根据球队名称筛选
    return await cupService.getdata({
        // teamname: cup.teamname
    });
}
