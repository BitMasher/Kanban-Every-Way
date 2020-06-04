const Router = require("@koa/router");

const router = new Router();

router.get("/", async (ctx) => {
	ctx.status = 200;
	ctx.body = await ctx.datastore.getKanban();
});

router.post("/:cardId", async (ctx) => {
	const card = {
		id: ctx.params.cardId,
		name: ctx.request.body.name,
		priority: ctx.request.body.priority,
		body: ctx.request.body.body,
		column: ctx.request.body.column
	}
	const updatedCard = await ctx.datastore.setCard(card);
	ctx.status = 200;
	ctx.body = updatedCard;
});

router.patch("/:cardId", async (ctx) => {
	const card = await ctx.datastore.getCard(ctx.params.cardId);
	card.column = ctx.request.body.columnId;
	await ctx.datastore.setCard(card);
	ctx.status = 200;
	ctx.body = card;
});

router.delete("/:cardId", async (ctx) => {
	await ctx.datastore.deleteCard(ctx.params.cardId);
	ctx.status = 204;
});

module.exports = router;
