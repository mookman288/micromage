export function header() {
	return document.createElement('header');
}

export function h(type, text, classes) {
	let h = document.createElement('h' + type);

	h.innerText = text;

	if (classes) {
		h.setAttribute('class', classes);
	}

	return h;
}

export function nav(classes) {
	let nav = document.createElement('nav');

	if (classes) {
		nav.setAttribute('class', classes);
	}

	return nav;
}