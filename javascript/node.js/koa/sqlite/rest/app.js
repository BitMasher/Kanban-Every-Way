const Koa = require("koa");
const datastore = require("./services/kanban");
const Router = require("@koa/router");
const kanbanRouter = require("./routes/kanban");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

app.context.datastore = datastore;

app.on("error", (err) => {
	console.log("server error ", err)
});

app.use(async (ctx, next) => {
	console.log(`${ctx.method} ${ctx.url}`)
	await next();
});

app.use(bodyParser());

app.use(require('koa-static')("public"));

router.use("/api", kanbanRouter.routes());

app.use(router.routes());

module.exports = app;
