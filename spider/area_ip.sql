/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50722
Source Host           : 127.0.0.1:3306
Source Database       : date

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2018-07-04 19:14:12
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for area_ip
-- ----------------------------
DROP TABLE IF EXISTS `area_ip`;
CREATE TABLE `area_ip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `area_origin` varchar(100) NOT NULL COMMENT '抓取的原始数据-未拆分省市',
  `area_province` varchar(100) DEFAULT NULL COMMENT '地区名称',
  `area_city` varchar(100) DEFAULT NULL,
  `area_count` bigint(15) DEFAULT NULL COMMENT '地区计数',
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `log_date` datetime DEFAULT NULL COMMENT '来源日志文件的日期',
  PRIMARY KEY (`id`,`area_origin`)
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8;
