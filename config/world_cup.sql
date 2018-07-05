/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50722
Source Host           : 127.0.0.1:3306
Source Database       : date

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2018-07-05 19:23:00
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for world_cup
-- ----------------------------
DROP TABLE IF EXISTS `world_cup`;
CREATE TABLE `world_cup` (
  `id` bigint(16) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `match_group` varchar(25) DEFAULT NULL COMMENT '比赛小组',
  `match_name` varchar(100) DEFAULT NULL COMMENT '第几组第几轮或 例：世界杯1/8决赛',
  `video_url` varchar(255) DEFAULT NULL COMMENT '播放地址',
  `match_date` datetime DEFAULT NULL COMMENT '比赛开始时间',
  `home_team` varchar(20) DEFAULT NULL COMMENT '主队球队名称',
  `home_badge` varchar(255) DEFAULT NULL COMMENT '主队国旗url',
  `home_goal` varchar(5) DEFAULT NULL COMMENT '主队进球数',
  `away_team` varchar(20) DEFAULT NULL COMMENT '客队球队名称',
  `away_badge` varchar(255) DEFAULT NULL COMMENT '客队国旗url',
  `away_goal` varchar(5) DEFAULT NULL COMMENT '主队进球数',
  `victory` int(2) DEFAULT NULL COMMENT '0未开赛 1 主队胜  2客队胜 3平',
  `create_time` datetime DEFAULT NULL COMMENT '记录创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=330 DEFAULT CHARSET=utf8;
