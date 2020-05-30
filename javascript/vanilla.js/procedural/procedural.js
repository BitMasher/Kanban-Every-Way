let data = {}

function saveData(data) {
	localStorage.setItem("data", JSON.stringify(data));
}

function deleteCard(card) {
	data[card.dataset.column] = data[card.dataset.column].filter((e) => e.id !== card.dataset.id);
	card.remove();
	saveData(data);
}

function editCard(card) {
	card.classList.add("edit");
	card.removeAttribute("draggable");
	const titleElem = card.querySelector(".card-name");
	const title = titleElem.innerText;
	const priorityElem = card.querySelector(".card-priority");
	const priority = priorityElem.innerText;
	const bodyElem = card.querySelector(".card-body");
	const body = bodyElem.innerText;

	const titleEdit = document.createElement("input");
	titleEdit.value = title;
	for (let i = titleElem.childNodes.length - 1; i >= 0; i--) {
		titleElem.removeChild(titleElem.childNodes.item(i));
	}
	titleElem.appendChild(titleEdit);

	const priorityEdit = document.querySelector(".templates>.priority-template").cloneNode(true);
	for (let i = 0; i < priorityEdit.options.length; i++) {
		if (priorityEdit.options[i].value === priority) {
			priorityEdit.selectedIndex = i;
		}
	}
	for (let i = priorityElem.childNodes.length - 1; i >= 0; i--) {
		priorityElem.removeChild(priorityElem.childNodes.item(i));
	}
	priorityElem.appendChild(priorityEdit);

	const bodyEdit = document.createElement("textarea");
	bodyEdit.value = body;
	for (let i = bodyElem.childNodes.length - 1; i >= 0; i--) {
		bodyElem.removeChild(bodyElem.childNodes.item(i));
	}
	bodyElem.appendChild(bodyEdit);
}

function saveCard(card) {
	card.classList.remove("edit");
	card.setAttribute("draggable", "true");
	const titleElem = card.querySelector(".card-name");
	const priorityElem = card.querySelector(".card-priority");
	const bodyElem = card.querySelector(".card-body");

	const titleEdit = titleElem.querySelector("input");
	titleElem.innerText = titleEdit.value;
	titleEdit.remove();

	const priorityEdit = priorityElem.querySelector("select");
	priorityElem.innerText = priorityEdit.value;

	const bodyEdit = bodyElem.querySelector("textarea");
	bodyElem.innerText = bodyEdit.value;

	data[card.dataset.column] = data[card.dataset.column].map((e) => {
		if (e.id !== card.dataset.id) {
			return e;
		}
		e.name = titleElem.innerText;
		e.priority = priorityElem.innerText;
		e.body = bodyElem.innerText;
		return e;
	});
	saveData(data);
}

function cardDrop(ev) {
	console.log(ev.target);
	if (ev.currentTarget.classList.contains("column")) {
		// get the card based on the id in the transfer data
		const card = document.querySelector(".card[data-id='" + ev.dataTransfer.getData("text") + "']");
		ev.currentTarget.style.backgroundColor = "";
		// append will overwrite the card's old parent, moving it to the new location
		ev.currentTarget.querySelector(".column-content").appendChild(card);

		// save the new layout to storage
		const cardData = data[card.dataset.column].find((e) => e.id === card.dataset.id);
		data[card.dataset.column] = data[card.dataset.column].filter((e) => e.id !== cardData.id);
		data[ev.currentTarget.dataset.title].push(cardData);
		card.dataset.column = ev.currentTarget.dataset.title;
		saveData(data);
	}
}

function cardDragOver(ev) {
	ev.preventDefault();
	ev.currentTarget.style.backgroundColor = "lightblue";
}

function cardDragOut(ev) {
	ev.preventDefault();
	ev.target.style.backgroundColor = "";
}

function cardDrag(ev) {
	// ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
	// this will be used to tell the drop target which card needs to be moved
	ev.dataTransfer.setData("text", ev.target.dataset.id);
	ev.currentTarget.style.backgroundColor = "lightgrey"
	ev.effectAllowed = "copyMove"
}

function addCard(column, editHandler, deleteHandler, id, title, priority, body) {
	const cardTemplate = document.querySelector(".templates .card");
	const card = cardTemplate.cloneNode(true);
	card.dataset.id = id || new Date().getTime().toString() + Math.random().toString();
	card.dataset.column = column.dataset.title;
	card.querySelector(".card-name").innerText = title || ""
	card.querySelector(".card-priority").innerText = priority || "Low";
	card.querySelector(".card-body").innerText = body || "";

	if (editHandler) {
		card.querySelector(".card-edit").addEventListener("click", (e) => editHandler(card, e));
	}
	if (deleteHandler) {
		card.querySelector(".card-delete").addEventListener("click", (e) => deleteHandler(card, e));
	}

	column.appendChild(card);

	if (!id) {
		data[column.dataset.title].push({
			id: card.dataset.id,
			name: title || "",
			priority: priority || "Low",
			body: body || ""
		});
		saveData(data);
	}

	card.querySelector(".card-save").addEventListener("click", () => saveCard(card));

	card.addEventListener("dragstart", cardDrag);

	return card;
}

function buildColumn(title, addHandler) {
	const columnTemplate = document.querySelector(".templates>.column");
	const column = columnTemplate.cloneNode(true);
	column.querySelector(".column-title").innerHTML = title;
	column.querySelector(".column-content").removeChild(
		column.querySelector(".column-content")
			.firstElementChild
	);
	column.dataset.title = title;
	if (addHandler) {
		column.querySelector(".column-add").addEventListener("click", (e) => {
			addHandler(column, e)
		})
	}
	column.addEventListener("dragenter", cardDragOver);
	column.addEventListener("dragleave", cardDragOut);
	column.addEventListener("dragover", cardDragOver);
	column.addEventListener("drop", cardDrop);
	return column;
}

function buildColumns() {
	const main = document.querySelector("main");

	let ls = localStorage.getItem("data")
	if (ls === null) {
		// on first load create our default swim lanes
		ls = "{\"Todo\":[],\"In Progress\":[],\"Done\":[]}";
	}
	data = JSON.parse(ls);
	for (let swim in data) {
		if (!data.hasOwnProperty(swim)) {
			continue;
		}
		const lane = buildColumn(swim, (sl) => addCard(sl, editCard, deleteCard))
		main.append(lane)
		for (let i = 0; i < data[swim].length; i++) {
			addCard(lane, editCard, deleteCard,
				data[swim][i].id, data[swim][i].name, data[swim][i].priority, data[swim][i].body);
		}
	}

	saveData(data);
}

window.addEventListener("DOMContentLoaded", () => {
	buildColumns();
	document.querySelector(".loading").style.display = "none";
});
