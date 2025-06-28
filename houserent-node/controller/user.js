/**
 * 在这里定义和用户相关的路由处理函数
 * 供/router/user.js模块进行调用
 */
const fs = require('fs');
const path = require("path");
const db = require('../db/index')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const config = require('../config')
const nowtime = require('../utils/date')
const { promisify } = require('util');
const query = promisify(db.query).bind(db);

// 注册用户的处理函数
exports.register = async (ctx) => {
  const userInfo = ctx.request.body;
  
  if (!userInfo.user || !userInfo.password || !userInfo.role || !userInfo.email || !userInfo.phone) {
    ctx.body = { status: 400, message: '用户名、密码、邮箱或电话为空' };
    return;
  }

  try {
    const sql = `select * from user where user=?`;
    const results = await query(sql, [userInfo.user]);
    
    if (results.length > 0) {
      ctx.body = { status: 400, message: '用户名已被注册，请更改后重新注册' };
      return;
    }

    // 对用户的密码进行 bcrypt 加密，返回值是加密后的密码字符串
    userInfo.password = bcrypt.hashSync(userInfo.password, 10);
    
    const sqlStr = `insert into user set ?`;
    const usermsg = {
      user: userInfo.user,
      password: userInfo.password,
      role: userInfo.role,
      phone: userInfo.phone,
      email: userInfo.email,
      name: userInfo.name,
      create_time: nowtime.getDate()
    };
    
    const result = await query(sqlStr, usermsg);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '注册用户失败，请稍后重试' };
      return;
    }
    
    ctx.body = { status: 200, message: '注册成功', data: usermsg };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 登录的处理函数
exports.login = async (ctx) => {
  const userInfo = ctx.request.body;
  
  try {
    const sql = `select * from user where user=?`;
    const results = await query(sql, userInfo.user);
    
    if (results.length !== 1) {
      ctx.body = { status: 400, message: '用户不存在，请重新输入' };
      return;
    }
    
    if (results[0].status == 0) {
      ctx.body = { status: 400, message: '用户已被禁用，请联系管理员' };
      return;
    }
    
    const compareResult = bcrypt.compareSync(userInfo.password, results[0].password);
    if (!compareResult) {
      ctx.body = { status: 400, message: '用户名或密码输入错误，请重新输入' };
      return;
    }
    
    const user = {
      id: results[0].id,
      name: results[0].user,
    };
    
    // jwt.sign(规则，加密名字，过期时间)
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: '12h' });
    
    // 将生成的Token字符串响应给客户端
    ctx.body = {
      status: 200,
      message: '登录成功!',
      id: results[0].id,
      // 返回身份
      role: results[0].role,
      // 为方便客户端使用，在服务器端凭借上 Bearer前缀
      token: 'Bearer ' + tokenStr
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 根据ID获取用户信息
exports.Info = async (ctx) => {
  try {
    const sql = `select * from user where id=?`;
    const results = await query(sql, ctx.params.id);
    
    if (results.length !== 1) {
      ctx.body = { status: 400, message: '获取用户信息失败' };
      return;
    }
    
    ctx.body = {
      status: 200,
      message: '获取用户信息成功!',
      data: results[0]
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 获取全部用户信息
exports.All = async (ctx) => {
  try {
    const sql = `select * from user order by id desc`;
    const results = await query(sql);
    
    if (results.length < 1) {
      ctx.body = { status: 400, message: '获取用户信息失败' };
      return;
    }
    
    ctx.body = {
      status: 200,
      message: '获取用户信息成功!',
      data: results
    };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 更改用户状态
exports.Status = async (ctx) => {
  try {
    const sql = `update user set status=? where id=?`;
    const result = await query(sql, [ctx.request.body.status, ctx.request.body.id]);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '更改用户状态失败' };
      return;
    }
    
    ctx.body = { status: 200, message: '更改用户状态成功!' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 更改用户身份
exports.Role = async (ctx) => {
  try {
    const sql = `update user set role=? where id=?`;
    const result = await query(sql, [ctx.request.body.role, ctx.request.body.id]);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '更改用户身份失败' };
      return;
    }
    
    ctx.body = { status: 200, message: '更改用户身份成功!' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 修改密码
exports.UpdatePwd = async (ctx) => {
  try {
    const sql = `update user set password=? where id=?`;
    const password = bcrypt.hashSync(ctx.request.body.password, 10);
    const result = await query(sql, [password, ctx.request.body.id]);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '修改密码失败' };
      return;
    }
    
    ctx.body = { status: 200, message: '修改密码成功!' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 更改用户信息
exports.UpdateInfo = async (ctx) => {
  try {
    const sql = `update user set ? where id=?`;
    const info = {
      name: ctx.request.body.name,
      phone: ctx.request.body.phone,
      email: ctx.request.body.email,
      idcard: ctx.request.body.idcard,
      sex: ctx.request.body.sex,
      job: ctx.request.body.job,
      hobby: ctx.request.body.hobby,
      desc: ctx.request.body.desc,
      avatar: ctx.request.body.avatar
    };
    
    // 如果没有上传头像，就删除avatar属性
    if (!info.avatar) {
      delete info.avatar;
    }
    
    const result = await query(sql, [info, ctx.request.body.id]);
    
    if (result.affectedRows !== 1) {
      ctx.body = { status: 400, message: '更改用户信息失败' };
      return;
    }
    
    ctx.body = { status: 200, message: '更改用户信息成功!' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};

// 上传头像
exports.upload = async (ctx) => {
  if (!ctx.file) {
    ctx.body = { status: 400, message: '请上传文件' };
    return;
  }
  
  // 将文件路径转换为 URL 路径
  const urlPath = ctx.file.path.replace(/\\/g, '/');
  
  ctx.body = {
    status: 200,
    message: '文件上传成功',
    file: ctx.file,
    url: 'http://localhost:5000/' + urlPath
  };
};

// 删除图片
exports.deleteImg = async (ctx) => {
  try {
    const url = ctx.request.body.url;
    // 获取文件名
    const filename = url.split('/').pop();
    // 拼接路径
    const filepath = path.join(__dirname, '../public/avatar/' + filename);
    // 删除文件
    fs.unlinkSync(filepath);
    
    ctx.body = { status: 200, message: '删除图片成功' };
  } catch (err) {
    ctx.body = { status: 400, message: err.message };
  }
};