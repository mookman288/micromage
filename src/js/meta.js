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

export function httpequivStatus(code) {
	let meta = document.createElement('meta');

	meta.setAttribute('http-equiv', 'Status');

	switch (code) {
		case 400:
			meta.setAttribute('content', '400 Bad Request');
		break;
		case 401:
			meta.setAttribute('content', '401 Unauthorized');
		break;
		case 404:
			meta.setAttribute('content', '404 Not Found');
		break;
		case 410:
			meta.setAttribute('content', '410 Gone');
		break;
		case 500:
			meta.setAttribute('content', '500 Internal Server Error');
		break;
		default:
			meta.setAttribute('content', '200 OK');
		break;
	}

	return meta;
}