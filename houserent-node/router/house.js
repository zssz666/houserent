const Router = require('koa-router');
const router = new Router();
const houseHandler = require("../controller/house");

// 添加新房源
router.post("/add", async (ctx) => {
  await houseHandler.addHouse(ctx);
});

// 获取房源列表
router.get("/list", async (ctx) => {
  await houseHandler.getHouseList(ctx);
});

// 查询未租出的房子
router.get("/unrented", async (ctx) => {
  await houseHandler.getUnrentedHouse(ctx);
});

// 编辑房源
router.post("/edit", async (ctx) => {
  await houseHandler.editHouse(ctx);
});

// 修改房源状态
router.post("/status", async (ctx) => {
  await houseHandler.changeHouseStatus(ctx);
});

// 根据ID获取房源信息
router.get("/:id", async (ctx) => {
  await houseHandler.getHouseById(ctx);
});

// 我的家列表
router.post("/my", async (ctx) => {
  await houseHandler.getMyHouseList(ctx);
});

// 根据名称、城市、类型、价格和面积区间查询房源
router.post("/search", async (ctx) => {
  await houseHandler.searchHouse(ctx);
});

// 根据房东ID获取房源信息
router.get("/owner/:id", async (ctx) => {
  await houseHandler.getHouseByOwnerId(ctx);
});

module.exports = router;