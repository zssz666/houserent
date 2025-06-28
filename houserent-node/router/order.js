const Router = require('koa-router');
const router = new Router();
const orderHandler = require("../controller/order");

// 添加订单
router.post("/add", async (ctx) => {
  await orderHandler.Add(ctx);
});

// 获取订单列表
router.get("/list", async (ctx) => {
  await orderHandler.GetList(ctx);
});

// 根据房东id获取订单详情
router.get("/ownerid/:id", async (ctx) => {
  await orderHandler.GetOrderByownerId(ctx);
});

// 根据租客id获取订单详情
router.get("/customerid/:id", async (ctx) => {
  await orderHandler.GetOrderBycustomerId(ctx);
});

// 修改订单状态
router.post("/status", async (ctx) => {
  await orderHandler.UpdateOrderStatus(ctx);
});

// 根据订单号获取订单详情
router.get("/orderNo/:id", async (ctx) => {
  await orderHandler.GetOrderByorderNo(ctx);
});

// 获取生效中的订单
router.get("/effective", async (ctx) => {
  await orderHandler.GetEffectOrder(ctx);
});

module.exports = router;