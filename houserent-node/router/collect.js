const Router = require('koa-router');
const router = new Router();
const collectHandler = require("../controller/collect");

// 获取当前用户收藏列表数据
router.get("/list/:id", async (ctx) => {
  await collectHandler.getCollectList(ctx);
});

// 添加收藏
router.post("/add", async (ctx) => {
  await collectHandler.addCollect(ctx);
});

// 删除收藏
router.get("/delete/:id", async (ctx) => {
  await collectHandler.deleteCollect(ctx);
});

module.exports = router;