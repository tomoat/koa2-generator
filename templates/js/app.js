const Koa = require('koa')
const app = new Koa()

const router = require('koa-router')
const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')

const config = require('./config')
const index = require('./routes/index')
const users = require('./routes/users')

const port = process.env.PORT || config.port

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
  .use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public'))
  .use(views(__dirname + '/views', {
    extension: '{views}'
  }))
  .use(router.routes())
  .use(router.allowedMethods())

// if you use nunjucks template engine please require nunjucks and uncomment on the following code
/*const nunjucks = require('nunjucks')
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
});*/

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

router.use('/', index.routes(), index.allowedMethods())
router.use('/users', users.routes(), users.allowedMethods())

app.use(router.routes(), router.allowedMethods())
// response

app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

app.listen(config.port, () => debug(`Listening on http://localhost:${config.port}`))

export default app
