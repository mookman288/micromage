export function header() {
	return document.createElement('header');
}

export function h(type, text) {
	let h = document.createElement('h' + type);

	h.innerText = text;

	return h;
}