const db = require("../db/index");
const nowtime = require("../utils/date");
const { promisify } = require("util");
const query = promisify(db.query).bind(db);
// ["http://localhost:5000/public/avatar/file-1704717641376.jpg","http://localhost:5000/public/avatar/file-1704717669273.png","http://localhost:5000/public/avatar/file-1704717690441.jpeg","http://localhost:5000/public/avatar/file-1704717708863.jpg"]

// 将 img_url 字段从 JSON 格式的字符串转换为数组
function parseImgUrl(results) {
  results.forEach((item) => {
    if (typeof item.img_url === "string") {
      try {
        item.img_url = JSON.parse(item.img_url);
      } catch (error) {
        console.error("Error parsing img_url:", error);
      }
    }
  });
}

//添加新房源
exports.addHouse = async (ctx) => {
  const houseInfo = ctx.request.body;
  const info = {
    create_time: nowtime.getDate(),
    owner_id: houseInfo.ownerId,
    rent_type: houseInfo.rentType,
    title: houseInfo.title,
    content: houseInfo.content,
    city: houseInfo.city,
    address: houseInfo.address,
    img_url: houseInfo.imgUrl,
    month_rent: houseInfo.monthRent,
    certificate: houseInfo.certificate,
    toilet: houseInfo.toilet,
    kichen: houseInfo.kichen,
    livingroom: houseInfo.livingroom,
    bedroom: houseInfo.bedroom,
    conditioner: houseInfo.conditioner,
    area: houseInfo.area,
    floor: houseInfo.floor,
    maxfloor: houseInfo.maxfloor,
    elevator: houseInfo.elevator,
    buildyear: houseInfo.buildyear,
    direction: houseInfo.direction,
    longitude_latitude: houseInfo.longitudeLatitude,
    contact_name: houseInfo.contactName,
    contact_phone: houseInfo.contactPhone,
  };

  try {
    const sql = "insert into house set ?";
    const results = await query(sql, info);

    if (results.affectedRows !== 1) {
      ctx.body = {
        status: 400,
        message: "添加房源失败，请稍后重试",
      };
      return;
    }

    ctx.body = {
      status: 200,
      message: "添加房源成功",
    };
  } catch (err) {
    ctx.body = {
      status: 404,
      message: err.message,
    };
  }
};

//编辑房源
exports.editHouse = async (ctx) => {
  const houseInfo = ctx.request.body;
  const info = {
    rent_type: houseInfo.rentType,
    title: houseInfo.title,
    content: houseInfo.content,
    city: houseInfo.city,
    address: houseInfo.address,
    img_url: houseInfo.imgUrl,
    month_rent: houseInfo.monthRent,
    certificate: houseInfo.certificate,
    toilet: houseInfo.toilet,
    kichen: houseInfo.kichen,
    livingroom: houseInfo.livingroom,
    bedroom: houseInfo.bedroom,
    conditioner: houseInfo.conditioner,
    area: houseInfo.area,
    floor: houseInfo.floor,
    maxfloor: houseInfo.maxfloor,
    elevator: houseInfo.elevator,
    buildyear: houseInfo.buildyear,
    direction: houseInfo.direction,
    longitude_latitude: houseInfo.longitudeLatitude,
    contact_name: houseInfo.contactName,
    contact_phone: houseInfo.contactPhone,
    status: -2,
  };

  try {
    const sql = "update house set ? where id=?";
    const results = await query(sql, [info, houseInfo.id]);

    if (results.affectedRows !== 1) {
      ctx.body = {
        status: 400,
        message: "编辑房源失败，请稍后重试",
      };
      return;
    }

    ctx.body = {
      status: 200,
      message: "编辑房源成功",
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//获取房源列表
exports.getHouseList = async (ctx) => {
  try {
    const sql = "select * from house where status != -1 ORDER BY id DESC";
    const results = await query(sql);

    ctx.body = {
      status: 0,
      message: "获取房源列表成功",
      data: results,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//修改房源状态
exports.changeHouseStatus = async (ctx) => {
  const id = ctx.request.body.id;
  const status = ctx.request.body.status;

  try {
    const sql = "update house set status=? where id=?";
    const results = await query(sql, [status, id]);

    if (results.affectedRows !== 1) {
      ctx.body = {
        status: 400,
        message: "修改房源状态失败，请稍后重试",
      };
      return;
    }

    ctx.body = {
      status: 200,
      message: "修改房源状态成功",
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//根据ID获取房源信息
exports.getHouseById = async (ctx) => {
  const id = ctx.params.id;

  try {
    const sql = "select * from house where id=?";
    const results = await query(sql, id);

    if (results.length !== 1) {
      ctx.body = {
        status: 400,
        message: "获取房源信息失败，请稍后重试",
      };
      return;
    }

    // 遍历查询结果，将 img_url 字段从 JSON 格式的字符串转换为数组
    parseImgUrl(results);

    ctx.body = {
      status: 200,
      message: "获取房源信息成功",
      data: results[0],
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

// 我的家列表
exports.getMyHouseList = async (ctx) => {
  const userId = ctx.request.body.id;

  try {
    const sql = `
      SELECT * 
      FROM house 
      WHERE id IN (
        SELECT house_id 
        FROM orders 
        WHERE o_status = 0 AND customer_id = ? 
      ) ORDER BY id DESC
    `;
    const results = await query(sql, [userId]);

    // 如果需要，将 img_url 字段从 JSON 格式的字符串转换为数组
    parseImgUrl(results);

    const sql2 = `SELECT * FROM orders WHERE o_status=0 AND customer_id=? ORDER BY id DESC`;
    const results2 = await query(sql2, [userId]);

    ctx.body = {
      status: 200,
      message: "获取我的房源列表成功",
      data: results,
      orders: results2,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//根据名称、城市、类型、价格区间查询房源(个别值为空时，不查询该条件)
exports.searchHouse = async (ctx) => {
  const houseInfo = ctx.request.body || {}; // 如果 ctx.request.body 为 undefined，则使用空对象

  // 为每个字段设置默认值
  const info = {
    title: houseInfo.title || "",
    city: houseInfo.city || "",
    rent_type: houseInfo.rentType || "",
    min_price: houseInfo.minPrice || 0,
    max_price: houseInfo.maxPrice || 999999, // 设置一个较大的默认最高价格
    min_area: houseInfo.minArea || 0,
    max_area: houseInfo.maxArea || 9999, // 设置一个较大的默认最大面积
  };

  try {
    const sql =
      "SELECT * FROM house WHERE title LIKE ? AND city LIKE ? AND rent_type LIKE ? AND month_rent BETWEEN ? AND ? AND status = 1 AND area BETWEEN ? AND ? ORDER BY id DESC";
    const results = await query(sql, [
      "%" + info.title + "%",
      "%" + info.city + "%",
      "%" + info.rent_type + "%",
      info.min_price,
      info.max_price,
      info.min_area,
      info.max_area,
    ]);

    // 遍历查询结果，将 img_url 字段从 JSON 格式的字符串转换为数组
    parseImgUrl(results);

    ctx.body = {
      status: 200,
      message: "查询房源成功",
      data: results,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

//根据房东ID获取房源信息
exports.getHouseByOwnerId = async (ctx) => {
  const id = ctx.params.id;

  try {
    const sql =
      "select * from house where owner_id=? and status != -1 ORDER BY id DESC";
    const results = await query(sql, id);

    // 遍历查询结果，将 img_url 字段从 JSON 格式的字符串转换为数组
    parseImgUrl(results);

    ctx.body = {
      status: 200,
      message: "获取房源信息成功",
      data: results,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};

// 查询未租出的房子
exports.getUnrentedHouse = async (ctx) => {
  try {
    const sql = "select * from house where status = 1 ORDER BY id DESC";
    const results = await query(sql);

    // 遍历查询结果，将 img_url 字段从 JSON 格式的字符串转换为数组
    parseImgUrl(results);

    ctx.body = {
      status: 200,
      message: "获取未租出的房子成功",
      data: results,
    };
  } catch (err) {
    ctx.body = {
      status: 400,
      message: err.message,
    };
  }
};
