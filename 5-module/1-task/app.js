const Koa = require('koa');
const app = new Koa();
const path = require('path');

const pathToStatic = path.join(__dirname, 'public');

app.use(require('koa-static')(pathToStatic));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/kys', async (ctx, next) => {
  console.log('kys');
  ctx.body = 'kys-kys';
  return next();
});

router.get('/subscribe', async (ctx, next) => {
  console.log('Subscribe');
  return next();
});

router.post('/publish', async (ctx, next) => {
  console.log('Publish');
  return next();
});

app.use(router.routes());

module.exports = app;
