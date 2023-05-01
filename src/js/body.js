export function article() {
	return document.createElement('article');
}

export function a(url, text, title, sitePath) {
	sitePath = sitePath ?? '';
	sitePath = (sitePath === '/') ? '' : sitePath;

	let a = document.createElement('a');

	a.innerText = text;

	if (url.startsWith('/')) {
		url = sitePath + '#' + url;
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