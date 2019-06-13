const Koa = require('koa');
const app = new Koa();
const path = require('path');

const pathToStatic = path.join(__dirname, 'public');

app.use(require('koa-static')(pathToStatic));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let clients = [];

router.get('/subscribe', async (ctx, next) => {
  const message = await new Promise((resolve, reject) => {
    clients.push(resolve);

    ctx.res.on('close', function() {
      clients.pop(resolve);
      resolve();
    });
  });

  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {

  const {message} = ctx.request.body;

  if (!message) {
    ctx.throw(400, 'Bad request! Field `message` is absent');
  }

  clients.forEach(function(resolve) {
    resolve(message);
  });

  clients = [];

  ctx.body = 'ok';
});

app.use(router.routes());

module.exports = app;
