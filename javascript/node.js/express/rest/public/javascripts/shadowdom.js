class Api {
	getData() {
		return fetch("api/", {
			method: "GET",
			mode: "same-origin",
			cache: "no-cache"
		});
	}

	saveCard(card, columnId) {
		return fetch("api/" + card.id, {
			method: "POST",
			mode: "same-origin",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({...card, column: columnId})
		});
	}

	deleteCard(cardId) {
		return fetch("api/" + cardId, {
			method: "DELETE",
			mode: "same-origin",
			cache: "no-cache"
		});
	}

	moveCard(cardId, columnId) {
		return fetch("api/" + cardId, {
			method: "PATCH",
			mode: "same-origin",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				cardId: cardId,
				columnId: columnId
			})
		});
	}
}

const api = new Api();

function createColumnElement() {
	customElements.define("x-column",
		class extends HTMLElement {

			get title() {
				return this.shadowRoot.querySelector("slot[name=title]").assignedElements()[0].innerText;
			}

			constructor() {
				super();
			}

			// noinspection JSUnusedGlobalSymbols
			connectedCallback() {
				const template = document.getElementById("column-template").content;
				this.attachShadow({mode: "open"}).appendChild(template.cloneNode(true));

				this.shadowRoot.querySelector(".column-add").addEventListener("click", (ev) => this.doAdd(ev));
			}

			doAdd() {
				// fires when someone clicks the add button
				// implementation is up to ui designer
				this.shadowRoot.dispatchEvent(new CustomEvent("add", {
					bubbles: true,
					composed: true,
					cancelable: true,
					detail: {
						column: this.title
					}
				}));
			}
		}
	);
}

function createCardElement() {
	customElements.define("x-card",
		class extends HTMLElement {
			get cardId() {
				return this.shadowRoot ? this.shadowRoot.host.getAttribute("x-card-id") : "";
			}

			get title() {
				return this.shadowRoot
					? this.shadowRoot.querySelector("slot[name=title]").assignedElements().length > 0
						? this.shadowRoot.querySelector("slot[name=title]").assignedElements()[0].innerText
						: ""
					: "";
			}

			get priority() {
				return this.shadowRoot
					? this.shadowRoot.querySelector("slot[name=priority]").assignedElements().length > 0
						? this.shadowRoot.querySelector("slot[name=priority]").assignedElements()[0].innerText
						: "Low"
					: "Low";
			}

			get description() {
				return this.shadowRoot
					? this.shadowRoot.querySelector("slot[name=description]").assignedElements().length > 0
						? this.shadowRoot.querySelector("slot[name=description]").assignedElements()[0].innerText
						: ""
					: "";
			}

			constructor() {
				super();
			}

			// noinspection JSUnusedGlobalSymbols
			connectedCallback() {
				const template = document.getElementById("card-template").content;
				this.attachShadow({mode: "open"}).appendChild(template.cloneNode(true));

				if (!this.shadowRoot.host.hasAttribute("x-card-id")) {
					this.shadowRoot.host.setAttribute("x-card-id", new Date().getTime().toString() + Math.random().toString());
				}

				if (this.shadowRoot.querySelector("slot[name=title]").assignedElements().length === 0) {
					const titleSlot = document.createElement("span");
					titleSlot.setAttribute("slot", "title");
					titleSlot.innerText = "Title";
					this.shadowRoot.host.appendChild(titleSlot);
				}
				if (this.shadowRoot.querySelector("slot[name=priority]").assignedElements().length === 0) {
					const prioritySlot = document.createElement("span");
					prioritySlot.setAttribute("slot", "priority");
					prioritySlot.innerText = "Low";
					this.shadowRoot.host.appendChild(prioritySlot);
				}
				if (this.shadowRoot.querySelector("slot[name=description]").assignedElements().length === 0) {
					const descriptionSlot = document.createElement("span");
					descriptionSlot.setAttribute("slot", "description");
					descriptionSlot.innerText = "Placeholder";
					this.shadowRoot.host.appendChild(descriptionSlot);
				}

				this.shadowRoot.querySelector(".card-edit").addEventListener("click", (ev) => this.doEdit(ev));
				this.shadowRoot.querySelector(".card-save").addEventListener("click", (ev) => this.doSave(ev));
				this.shadowRoot.querySelector(".card-delete").addEventListener("click", (ev) => this.doDelete(ev));

				if (this.shadowRoot.host.getAttribute("draggable") === "true") {
					const card = this.shadowRoot.querySelector(".card");
					card.setAttribute("draggable", "true");
				}
			}

			doDelete(ev) {
				// fires before removing card from the dom, to prevent deletion cancel event
				if (!this.shadowRoot.dispatchEvent(new CustomEvent("delete", {
					bubbles: true,
					cancelable: true,
					composed: true,
					detail: {
						cardId: this.cardId
					}
				}))) {
					ev.preventDefault();
					return;
				}
				this.shadowRoot.host.remove();
			}

			doEdit(ev) {
				// gives control over the UI designer if they want cards to be editable or not
				// if you do not want the card to be editable then cancel this event
				if (!this.shadowRoot.dispatchEvent(new CustomEvent("edit", {
					bubbles: true,
					cancelable: true,
					composed: true,
					detail: {
						cardId: this.cardId
					}
				}))) {
					ev.preventDefault();
					return;
				}
				this.shadowRoot.querySelector(".card").classList.add("edit");
				this.shadowRoot.querySelector(".card").removeAttribute("draggable");
				const titleSlot = this.shadowRoot.querySelector("slot[name=title]").assignedElements()[0];
				const prioritySlot = this.shadowRoot.querySelector("slot[name=priority]").assignedElements()[0];
				const descriptionSlot = this.shadowRoot.querySelector("slot[name=description]").assignedElements()[0];

				this.shadowRoot.querySelector("[name=title-edit]").value = titleSlot.innerText;
				const opts = this.shadowRoot.querySelector("[name=priority-edit]");
				for (let i = 0; i < opts.options.length; i++) {
					if (opts.options[i].value === prioritySlot.innerText) {
						opts.selectedIndex = i;
						break;
					}
				}
				this.shadowRoot.querySelector("[name=description-edit]").value = descriptionSlot.innerText;
			}

			doSave() {
				this.shadowRoot.querySelector(".card").classList.remove("edit");
				if (this.shadowRoot.host.getAttribute("draggable") === "true") {
					this.shadowRoot.querySelector(".card").setAttribute("draggable", "true");
				}
				const titleSlot = this.shadowRoot.querySelector("slot[name=title]").assignedElements()[0];
				const prioritySlot = this.shadowRoot.querySelector("slot[name=priority]").assignedElements()[0];
				const descriptionSlot = this.shadowRoot.querySelector("slot[name=description]").assignedElements()[0];

				const newTitle = this.shadowRoot.querySelector("[name=title-edit]").value;
				const newPriority = this.shadowRoot.querySelector("[name=priority-edit]").value;
				const newDescription = this.shadowRoot.querySelector("[name=description-edit]").value;

				// this is the hook where you should persist the data
				// if something goes wrong in persisting the data then cancel the event
				if (!this.shadowRoot.dispatchEvent(new CustomEvent("save", {
					bubbles: true,
					cancelable: true,
					composed: true,
					detail: {
						cardId: this.cardId,
						newTitle: newTitle,
						newPriority: newPriority,
						newDescription: newDescription
					}
				}))) {
					return;
				}

				titleSlot.innerText = newTitle;
				prioritySlot.innerText = newPriority;
				descriptionSlot.innerText = newDescription;

				// this indicates that all updates to the dom have been completed
				// it is too late to cancel the update at this point
				this.shadowRoot.dispatchEvent(new CustomEvent("saved", {
					bubbles: true,
					cancelable: false,
					composed: true,
					detail: {
						cardId: this.cardId,
						newTitle: newTitle,
						newPriority: newPriority,
						newDescription: newDescription
					}
				}));

			}
		}
	);
}

let data = {};

function addCard(ev) {
	const card = document.createElement("x-card");
	card.addEventListener("delete", deleteCard);
	card.addEventListener("save", saveCard);
	ev.target.appendChild(card);
	data[ev.detail.column].push({
		id: card.cardId,
		name: card.title,
		priority: card.priority,
		body: card.description
	});
}

function saveCard(ev) {
	data[ev.target.parentElement.title] = data[ev.target.parentElement.title].map((e) => {
		if (e.id !== ev.detail.cardId) {
			return e;
		}
		e.name = ev.detail.newTitle;
		e.priority = ev.detail.newPriority;
		e.body = ev.detail.newDescription;
		return e;
	});
	api.saveCard(data[ev.target.parentElement.title].find((e) => e.id === ev.detail.cardId), ev.target.parentElement.title).finally(() => {
	});
}

function deleteCard(ev) {
	data[ev.target.parentElement.title] = data[ev.target.parentElement.title].filter((e) => e.id !== ev.detail.cardId);

	api.deleteCard(ev.detail.cardId).finally(() => {
	});
}

function cardDrop(ev) {
	if (ev.currentTarget.tagName === "X-COLUMN") {
		// get the card based on the id in the transfer data
		const card = document.querySelector("x-card[x-card-id='" + ev.dataTransfer.getData("text") + "']");
		const oldColumn = card.parentElement.title;
		ev.currentTarget.style.backgroundColor = "";
		// append will overwrite the card's old parent, moving it to the new location
		ev.currentTarget.appendChild(card);

		// save the new layout to storage
		const cardData = data[oldColumn].find((e) => e.id === card.cardId);
		data[oldColumn] = data[oldColumn].filter((e) => e.id !== cardData.id);
		data[ev.currentTarget.title].push(cardData);
		api.moveCard(ev.dataTransfer.getData("text"), ev.currentTarget.title).finally(() => {
		});
		;
	}
}

function cardDragOver(ev) {
	console.log("cardDragOver", ev);
	ev.preventDefault();
	ev.currentTarget.style.backgroundColor = "lightblue";
}

function cardDragOut(ev) {
	console.log("cardDragOut", ev);
	ev.preventDefault();
	ev.target.style.backgroundColor = "";
}

function cardDrag(ev) {
	console.log("cardDrag", ev);
	// ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
	// this will be used to tell the drop target which card needs to be moved
	ev.dataTransfer.setData("text", ev.target.cardId);
	ev.currentTarget.style.backgroundColor = "lightgrey"
	ev.effectAllowed = "copyMove"
}

function createColumn(title, childFn) {
	const lane = document.createElement("x-column");

	const titleSlot = document.createElement("span");
	titleSlot.setAttribute("slot", "title");
	titleSlot.innerText = title;
	lane.appendChild(titleSlot);

	lane.addEventListener("dragenter", cardDragOver);
	lane.addEventListener("dragleave", cardDragOut);
	lane.addEventListener("dragover", cardDragOver);
	lane.addEventListener("drop", cardDrop);

	for (let child of childFn()) {
		lane.appendChild(child);
	}

	lane.addEventListener("add", addCard);

	return lane;
}

function createCard(cardDetails) {
	const card = document.createElement("x-card");
	card.setAttribute("draggable", "true");
	card.setAttribute("x-card-id", cardDetails.id)

	// the name of the card
	const nameSlot = document.createElement("span");
	nameSlot.setAttribute("slot", "title");
	nameSlot.innerText = cardDetails.name;
	card.appendChild(nameSlot);

	// the priority of the card
	const prioritySlot = document.createElement("span");
	prioritySlot.setAttribute("slot", "priority");
	prioritySlot.innerText = cardDetails.priority;
	card.appendChild(prioritySlot);

	// the description of the card
	const descriptionSlot = document.createElement("span");
	descriptionSlot.setAttribute("slot", "description");
	descriptionSlot.innerText = cardDetails.body;
	card.appendChild(descriptionSlot);

	card.addEventListener("delete", deleteCard);
	card.addEventListener("save", saveCard);
	card.addEventListener("dragstart", cardDrag);
	return card;
}

function createColumns() {
	const main = document.querySelector("main");

	api.getData().then(response => response.json()).then(ls => {
		data = ls;
		for (let swim in data) {
			if (!data.hasOwnProperty(swim)) {
				continue;
			}

			// create a column and a child generator from data store
			main.appendChild(createColumn(swim, function* () {
				for (let i = 0; i < data[swim].length; i++) {
					yield createCard(data[swim][i]);
				}
			}));
		}
	});
}

window.addEventListener("DOMContentLoaded", () => {
	createColumnElement();
	createCardElement();
	createColumns();

});
