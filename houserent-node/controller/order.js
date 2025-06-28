const db = require('../db/index')
const nowtime = require('../utils/date')
const { sendEmail } = require("../utils/sendEmail"); //发送邮件
const { promisify } = require('util');
const query = promisify(db.query).bind(db);

// 添加订单
exports.Add = async (ctx) => {
  const orderInfo = ctx.request.body;
  const sql = `insert into orders set ?`;
  const nowt = new Date();
  const ordermsg = {
    customer_id: orderInfo.customerid,
    owner_id: orderInfo.ownerid,
    house_id: orderInfo.houseid,
    o_status: orderInfo.status,
    month_rent: orderInfo.monthrent,
    day_num: orderInfo.daynum,
    total_amount: orderInfo.totalamount,
    start_date: orderInfo.startdate,
    end_date: orderInfo.enddate,
    create_time: nowtime.getDate(),
    order_number: nowt.toISOString().slice(0, 19).replace(/\D/g, ''),
  };
  
  try {
    const results = await query(sql, ordermsg);
    
    if (results.affectedRows !== 1) {
      ctx.body = { status: 400, message: '添加订单失败，请稍后重试' };
      return;
    }
    
    ctx.body = {
      status: 200,
      message: '添加订单成功',
      data: ordermsg
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 获取订单列表
exports.GetList = async (ctx) => {
  try {
    const sql = `select * from orders ORDER BY id DESC`;
    const results = await query(sql);
    
    ctx.body = {
      status: 200,
      message: '获取订单列表成功',
      data: results
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 根据房东id获取订单详情
exports.GetOrderByownerId = async (ctx) => {
  try {
    const sql = `select * from orders where owner_id=? ORDER BY id DESC`;
    const results = await query(sql, ctx.params.id);
    
    ctx.body = {
      status: 200,
      message: '获取订单详情成功',
      data: results
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 根据租客id获取订单详情
exports.GetOrderBycustomerId = async (ctx) => {
  try {
    const sql = `select * from orders where customer_id=? ORDER BY id DESC`;
    const results = await query(sql, ctx.params.id);
    
    ctx.body = {
      status: 200,
      message: '获取订单详情成功',
      data: results
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 修改订单状态
exports.UpdateOrderStatus = async (ctx) => {
  try {
    const sql = `update orders set o_status=? where id=?`;
    const result = await query(sql, [ctx.request.body.status, ctx.request.body.id]);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '修改订单状态失败，请稍后重试' };
      return;
    }
    
    // 确保 customerEmail 和 ownerEmail 是有效的电子邮件地址
    try {
      if (!validateEmail(ctx.request.body.customerEmail) || !validateEmail(ctx.request.body.ownerEmail)) {
        throw new Error('无效的电子邮件地址');
      }
      // 发送邮件
      if (ctx.request.body.status >= 0 && ctx.request.body.houseTitle) { // 0生效中 1已退租 2待审核
        // 租客邮箱，房东邮箱，状态，订单号，房源标题
        await sendEmail(
          ctx.request.body.customerEmail, 
          ctx.request.body.ownerEmail, 
          ctx.request.body.status, 
          ctx.request.body.orderNumber, 
          ctx.request.body.houseTitle
        );
      }
    } catch (error) {
      console.error(error.message);
      // 处理错误，例如返回一个错误响应
      ctx.body = {
        status: 200,
        message: '修改订单状态成功，但租客或房东的电子邮件地址无效，邮件发送失败'
      };
      return;
    }
    
    ctx.body = { status: 200, message: '修改订单状态成功' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 验证电子邮件地址的函数
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// 根据订单号获取订单详情
exports.GetOrderByorderNo = async (ctx) => {
  try {
    const sql = `select * from orders where order_number=?`;
    const results = await query(sql, ctx.params.id);
    
    ctx.body = {
      status: 200,
      message: '获取订单详情成功',
      data: results
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 获取生效中的订单
exports.GetEffectOrder = async (ctx) => {
  try {
    const sql = `select * from orders where o_status= 0`;
    const results = await query(sql);
    
    ctx.body = {
      status: 200,
      message: '获取生效中的订单成功',
      data: {
        data: results
      }
    };
  } catch (err) {
    ctx.body = { 
      status: 400, 
      message: err.message,
      data: null 
    };
  }
};