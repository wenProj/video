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
		area_origin: {
            type: Sequelize.STRING(255),
            allowNull: true,
			field: 'area_origin'
		},
		area_country: {
            type: Sequelize.STRING(100),
            allowNull: true,
			field: 'area_country'
		},
		area_province: {
            type: Sequelize.STRING(100),
            allowNull: true,
			field: 'area_province'
		},
		area_city: {
			type: Sequelize.STRING(100),
			allowNull: true,
			field: 'area_city'
		},
		access_count: {
            type: Sequelize.BIGINT(15),
            allowNull: true,
			field: 'access_count'
        },
        last_access_ip: {
            type: Sequelize.STRING(50),
            allowNull: true,
			field: 'last_access_ip'
		},
		update_time: {
            type: Sequelize.DATE,
            allowNull: true,
			field: 'update_time'
        },
		log_date: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'log_date'
        }
	}, {
		tableName: 'area_ip',
		timestamps: false,
		underscoredAll: false//驼峰规则
	});
};

module.exports={
    db:db
}