// 导入mysql模块
const mysql = require('mysql2');

// 创建数据库连接对象
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123123',
    database: 'zufang'
});

// 向外共享db数据库连接对象
module.exports = db;