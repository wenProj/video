var Sequelize = require('sequelize');

module.exports = new Sequelize('iplonlat', 'dqpay', 'kVmffV&p', {
  host: 'universe.cluster-ro-c0sdt8ew9eze.ap-southeast-1.rds.amazonaws.com', // 数据库地址
  dialect: 'mysql', // 指定连接的数据库类型
  pool: {
      max: 5, // 连接池中最大连接数量
      min: 0, // 连接池中最小连接数量
      idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
  },
  timezone: '+08:00'//设置时区   GMT时间+8小时=我们的时间
});