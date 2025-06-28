const Router = require('koa-router');
//创建路由对象
const router = new Router()
//导入登录注册处理函数模块
const userHandler = require("../controller/user")
//导入上传头像处理模块
const upload = require("../utils/upload")

//注册
router.post("/register", async (ctx) => {
  await userHandler.register(ctx);
});

//登录
router.post("/login", async (ctx) => {
  await userHandler.login(ctx);
});

//根据ID获取用户信息
router.get("/info/:id", async (ctx) => {
  await userHandler.Info(ctx);
});

//获取全部用户信息
router.get("/all", async (ctx) => {
  await userHandler.All(ctx);
});

//更改用户状态
router.post("/status", async (ctx) => {
  await userHandler.Status(ctx);
});

//更改用户身份
router.post("/role", async (ctx) => {
  await userHandler.Role(ctx);
});

//修改密码
router.post("/updatepwd", async (ctx) => {
  await userHandler.UpdatePwd(ctx);
});

//更改用户信息
router.post("/updateinfo", async (ctx) => {
  await userHandler.UpdateInfo(ctx);
});

// 上传头像 - 使用koa-multer
router.post('/upload', upload.single('file'), async (ctx) => {
  await userHandler.upload(ctx);
});

// 删除图片
router.post('/deleteimg', async (ctx) => {
  await userHandler.deleteImg(ctx);
});



module.exports = router