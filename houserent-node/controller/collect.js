const db = require("../db/index");
const nowtime = require("../utils/date");
const { promisify } = require("util");
const query = promisify(db.query).bind(db);

//获取当前用户收藏列表数据
exports.getCollectList = async (ctx) => {
  try {
    //查询语句
    const sqlStr = "select * from collect where user_id = ? order by id desc";
    //执行sql语句
    const results = await query(sqlStr, ctx.params.id);

    // 执行 SQL 语句成功
    ctx.body = {
      status: 200,
      message: "获取收藏列表成功！",
      data: results,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//添加收藏
exports.addCollect = async (ctx) => {
  try {
    const collectmsg = ctx.request.body;
    const msg = {
      user_id: collectmsg.userid,
      house_id: collectmsg.houseid,
      create_time: nowtime.getDate(),
      title: collectmsg.title,
      address: collectmsg.address,
      month_rent: collectmsg.monthrent,
      img: collectmsg.img,
    };

    //查询语句
    const sqlStr = "select * from collect where user_id = ? and house_id = ?";
    //执行sql语句
    const results = await query(sqlStr, [msg.user_id, msg.house_id]);

    // 执行 SQL 语句成功
    if (results.length > 0) {
      //收藏过了
      ctx.body = {
        status: 201,
        message: "该商品已收藏！",
      };
      return;
    }

    //没有收藏过
    //添加收藏
    const insertSql = "insert into collect set ?";
    //执行sql语句
    const insertResults = await query(insertSql, msg);

    // 执行 SQL 语句成功
    ctx.body = {
      status: 200,
      message: "收藏成功！",
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//删除收藏
exports.deleteCollect = async (ctx) => {
  try {
    //删除语句
    const sqlStr = "delete from collect where id = ?";
    //执行sql语句
    await query(sqlStr, ctx.params.id);

    // 执行 SQL 语句成功
    ctx.body = {
      status: 200,
      message: "取消收藏成功！",
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};
