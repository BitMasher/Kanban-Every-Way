const request = require("supertest");
const app = require("../app");

describe("Test kanban data endpoint", () => {

	test("It should respond with a kanban data structure", done => {
		return request(app)
			.get("/api/")
			.expect(200)
			.expect((res) => {
				if (!('Todo' in res.body)) throw new Error("Missing Todo column");
				if (!('In Progress' in res.body)) throw new Error("Missing In Progress column");
				if (!('Done' in res.body)) throw new Error("Missing Done column");
			})
			.end(done);
	});
});

describe("Test kanban card api", () => {

	const card = {
		id: "testid",
		name: "testname",
		priority: "High",
		body: "test description",
		column: "Todo"
	}

	test("It should create a new kanban card", done => {
		return request(app)
			.post("/api/" + card.id)
			.send(card)
			.expect(200)
			.expect((res) => {
				const errs = [];
				if (!('id' in res.body)) errs.push('Missing card id property');
				if (!('name' in res.body)) errs.push('Missing card name property');
				if (!('priority' in res.body)) errs.push('Missing card priority property');
				if (!('body' in res.body)) errs.push('Missing card body property');
				if (res.body.id !== card.id) errs.push('Returned card id does not match provided id');
				if (res.body.name !== card.name) errs.push('Returned card name does not match provided name');
				if (res.body.priority !== card.priority) errs.push('Returned card priority does not match provided priority');
				if (res.body.body !== card.body) errs.push('Returned card body does not match provided card body');
				if (errs.length > 0) {
					throw new Error(errs.join("\n"));
				}
			})
			.end(done);
	});

	test("The new card should be in the kanban column data", done => {
		return request(app)
			.get("/api/")
			.expect(200)
			.expect((res) => {
				if (!res.body[card.column].find((e) => e.id === card.id)) throw new Error("New card not found in " + card.column + " list");
			})
			.end(done)
	});

	test("The move request should return success", done => {
		card.column = "Done";
		return request(app)
			.patch("/api/" + card.id)
			.send({
				cardId: card.id,
				columnId: card.column,
			})
			.expect(200)
			.expect((res) => {
				const errs = [];
				if (!('id' in res.body)) errs.push('Missing card id property');
				if (!('name' in res.body)) errs.push('Missing card name property');
				if (!('priority' in res.body)) errs.push('Missing card priority property');
				if (!('body' in res.body)) errs.push('Missing card body property');
				if (res.body.id !== card.id) errs.push('Returned card id does not match provided id');
				if (res.body.name !== card.name) errs.push('Returned card name does not match provided name');
				if (res.body.priority !== card.priority) errs.push('Returned card priority does not match provided priority');
				if (res.body.body !== card.body) errs.push('Returned card body does not match provided card body');
				if (errs.length > 0) {
					throw new Error(errs.join("\n"));
				}
			})
			.end(done);
	})

	test("The card should be in the new kanban column", done => {
		return request(app)
			.get("/api/")
			.expect(200)
			.expect((res) => {
				if (!res.body[card.column].find((e) => e.id === card.id)) throw new Error("New card not found in " + card.column + " list");
			})
			.end(done)
	});

	test("The delete endpoint should return success", done => {
		return request(app)
			.delete("/api/" + card.id)
			.expect(204)
			.expect((res) => {
				if (res.body.length > 0) throw new Error("Expected empty body");
			})
			.end(done);
	});

	test("The deleted card should no longer be in the kanban data", done => {
		return request(app)
			.get("/api")
			.expect(200)
			.expect(res => {
				if (res.body[card.column].find((e) => e.id === card.id)) throw new Error("Deleted card was found in data");
			})
			.end(done);
	});
});
