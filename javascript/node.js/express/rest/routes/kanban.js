const express = require('express');
const router = express.Router();
const kanban = require("../services/kanban");

/* GET users listing. */
router.get('/', async function (req, res, next) {
	const data = await kanban.getKanban();
	res.status(200).json(data);
});

router.delete("/:cardId", async function(req, res, next) {
	await kanban.deleteCard(req.params['cardId']);
	res.status(204).send();
});

router.post("/:cardId", async function(req, res, next) {
	const card = {
		id: req.params['cardId'],
		name: req.body.name,
		priority: req.body.priority,
		body: req.body.body,
		column: req.body.column
	}
	const updatedCard = await kanban.setCard(card);
	res.status(200).json(updatedCard);
});

router.patch("/:cardId", async function(req, res, next) {
	const card = await kanban.getCard(req.params['cardId']);
	card.column = req.body.columnId;
	await kanban.setCard(card);
	res.status(200).json(card);
});

module.exports = router;
