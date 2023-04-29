export function description(text) {
	let desc = document.createElement('meta');

	desc.setAttribute('name', 'description');
	desc.setAttribute('content', text);

	return desc;
}

export function title(text) {
	let title = document.createElement('title');

	title.innerText = text;

	return title;
}