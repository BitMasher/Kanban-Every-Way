const kanban = require('./kanban');

describe("Test the kanban data layer", () => {

	const initializedObject = {
		'Todo': [],
		'In Progress': [],
		'Done': []
	};

	const card = {
		id: "test123",
		name: "testname",
		priority: "High",
		body: "test description",
		column: "Todo"
	}

	test("The kanban api should initialize to a blank kanban", async done => {
		const data = await kanban.getKanban();
		expect(data).toMatchObject(initializedObject);
		done();
	});

	test("The kanban api should insert the card", async done => {
		await kanban.setCard(card);
		const data = await kanban.getKanban();
		expect(data['Todo']).toContainEqual({
			id: "test123",
			name: "testname",
			priority: "High",
			body: "test description"
		});
		done();
	});

	test("The kanban api should get the card requested", async done => {
		const data = await kanban.getCard(card.id);
		expect(data).toMatchObject(card);
		done();
	})

	test("The kanban api should move the card", async done => {
		card.column = "Done";
		await kanban.setCard(card)
		const data = await kanban.getKanban();
		expect(data['Todo']).not.toContainEqual({
			id: "test123",
			name: "testname",
			priority: "High",
			body: "test description"
		});
		expect(data['Done']).toContainEqual({
			id: "test123",
			name: "testname",
			priority: "High",
			body: "test description"
		});
		done();
	});

	test("The kanban api should delete the card", async done => {
		await kanban.deleteCard(card.id);
		const data = await kanban.getKanban();
		expect(data).toMatchObject(initializedObject);
		done();
	});
});
