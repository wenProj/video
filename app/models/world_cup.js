var Sequelize = require('sequelize');
var sequelize = require('../../config/sequelize_db');//数据库配置

/* jshint indent: 1 */

let db = () => {
	return sequelize.define('fundoutOrder', {
		id: {
			type: Sequelize.BIGINT(16).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		match_group: {
            type: Sequelize.STRING(25),
            allowNull: true,
			field: 'match_group'
		},
		match_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
			field: 'match_name'
		},
		video_url: {
            type: Sequelize.STRING(255),
            allowNull: true,
			field: 'video_url'
		},
		match_date: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'match_date'
		},
		home_team: {
            type: Sequelize.STRING(20),
            allowNull: true,
			field: 'home_team'
        },
        home_badge: {
            type: Sequelize.STRING(255),
            allowNull: true,
			field: 'home_badge'
		},
		home_goal: {
            type: Sequelize.STRING(5),
            allowNull: true,
			field: 'home_goal'
        },
		away_team: {
			type: Sequelize.STRING(20),
			allowNull: true,
			field: 'away_team'
        },
        away_badge: {
            type: Sequelize.STRING(255),
            allowNull: true,
			field: 'away_badge'
		},
		away_goal: {
            type: Sequelize.STRING(5),
            allowNull: true,
			field: 'away_goal'
        },
        victory: {
			type: Sequelize.STRING(20),
			allowNull: true,
			field: 'victory'
        },
        create_time: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'create_time'
		}
	}, {
		tableName: 'world_cup',
		timestamps: false,
		underscoredAll: false//驼峰规则
	});
};

module.exports={
    db:db
}