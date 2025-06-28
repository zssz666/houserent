// 导入koa模块
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const jwt = require('koa-jwt');
const serve = require('koa-static');
const path = require('path');
const config = require('./config');

// 添加对 ReadableStream 的支持
const { ReadableStream } = require('stream/web');
global.ReadableStream = ReadableStream;

// 使用中间件
app.use(cors());
app.use(bodyParser());

// 静态文件服务
app.use(serve(path.join(__dirname, '')));

// JWT 认证中间件 (可选，根据需要取消注释)
// app.use(jwt({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }));

// 路由中间件
const router = new Router();

// 导入路由模块
const userRouter = require('./router/user');
const orderRouter = require('./router/order');
const collectRouter = require('./router/collect');
const houseRouter = require('./router/house');

// 注册路由
router.use('/api/user', userRouter.routes(), userRouter.allowedMethods());
router.use('/api/order', orderRouter.routes(), orderRouter.allowedMethods());
router.use('/api/collect', collectRouter.routes(), collectRouter.allowedMethods());
router.use('/api/house', houseRouter.routes(), houseRouter.allowedMethods());

// 应用路由中间件
app.use(router.routes()).use(router.allowedMethods());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 捕获身份认证失败的错误
    if (err.status === 401) {
      ctx.body = { status: 1, message: '身份认证失败！' };
    } else {
      // 未知的错误
      ctx.body = { status: 1, message: err instanceof Error ? err.message : err };
    }
  }
});

// 导入订单调度器模块
const orderScheduler = require('./utils/scheduler');
// 启动订单调度器
orderScheduler.startOrderScheduler();

const port = 5000;
app.listen(port, () => console.log(`Server running on port http://127.0.0.1:${port}`));