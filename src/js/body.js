export function article() {
	return document.createElement('article');
}

export function a(url, text, title, sitePath) {
	sitePath = sitePath ?? '';
	sitePath = (sitePath === '/') ? '' : sitePath;

	let a = document.createElement('a');

	a.innerText = text;

	if (url.startsWith('/')) {
		url = (url.length < 2) ? sitePath : sitePath + '#' + url;
		a.setAttribute('data-navigo', true);
	} else {
		a.setAttribute('target', '_blank');
		a.setAttribute('rel', 'noopener');
	}

	a.setAttribute('href', url);

	if (title) {
		a.setAttribute('title', title);
	}

	return a;
}

export function div(classes) {
	let div = document.createElement('div');

	if (classes) {
		div.setAttribute('class', classes);
	}

	return div;
}

export function li(text, classes) {
	let li = document.createElement('li');

	if (text) {
		li.innerText = text;
	}

	if (classes) {
		li.setAttribute('class', classes);
	}

	return li;
}

export function list(type, classes) {
	let list = document.createElement((type == 'ordered') ? 'ol' : 'ul');

	if (classes) {
		list.setAttribute('class', classes);
	}

	return list;
}