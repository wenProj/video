const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const logFormat = printf(log => {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    return `${time} [${log.label}] ${log.level}: ${log.message}`
});
require('winston-daily-rotate-file');

/**
 * 配置日志的输出方式，transports.Console为控制台输出，transports.File为日志文件输出
 */
// const logOutputConfig = [new transports.Console(), new transports.File({
//     name:'info-file',
//     filename:'/datalog/logs/dqiangpay/website/website.log',
//     level:'info'
// })]
const logOutputConfig = [new transports.Console(), new transports.DailyRotateFile({
    name:'info-file',
    filename:'C:/Users/test03/Desktop/area_ip_log/ipLonLat.log',//area_ip3
    datePattern: 'YYYY-MM-DD',
    level:'info',
    maxFiles: '14d'
})];

/**
 * 日志等级为debug，但是只保存info等级的日志这样就可以兼顾调试是日志保存
 * @param {String} msg 日志的模块名，在项目有多个子模块时为了避免日志标识混乱建议msg传 子模块名+空格+JS文件名
 */
exports.createLogger = (msg) => {
    return createLogger({
        level: 'debug',
        format: combine(
            label({ label: msg }),
            timestamp(),
            logFormat
        ),
        transports: logOutputConfig
    })
}