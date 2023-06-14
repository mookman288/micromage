import '../css/stylesheet.scss';

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Navigo from 'navigo';

import { title, description, httpequivStatus } from './meta';
import { h, header, nav } from './header';
import { slugify } from './helper';
import { a, article, div, hr, li, list, p, span } from './body';

//https://github.com/cure53/DOMPurify/issues/317#issuecomment-912474068
const TEMPORARY_ATTRIBUTE = 'data-temp-href-target'

DOMPurify.addHook('beforeSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
        if (!node.hasAttribute('target')) {
            node.setAttribute('target', '_self');
        }

        if (node.hasAttribute('target')) {
            node.setAttribute(TEMPORARY_ATTRIBUTE, node.getAttribute('target'));
        }
    }
})

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute(TEMPORARY_ATTRIBUTE)) {
        node.setAttribute('target', node.getAttribute(TEMPORARY_ATTRIBUTE));
        node.removeAttribute(TEMPORARY_ATTRIBUTE);
        if (node.getAttribute('target') === '_blank') {
            node.setAttribute('rel', 'noopener');
        }
    }
})

marked.setOptions({
	headerIds: false
});

fetch('./config.json').then(response => response.json())
	.then((config) => {
		const mainHeader = (route) => {
			//Create a header.
			const mainHeader = new header();

			//If the url of the route is empty or the root.
			if (route.url == '' || route.url == '/') {
				mainHeader.insertAdjacentElement('beforeend', new h(1, config.name, 'logo'));

				if (config.tagline) {
					mainHeader.insertAdjacentElement('beforeend', new h(2, config.tagline, 'tagline'));
				}
			} else {
				mainHeader.insertAdjacentElement('beforeend', new span(config.name, 'logo'));

				if (config.tagline) {
					mainHeader.insertAdjacentElement('beforeend', new span(config.tagline, 'tagline'));
				}
			}

			mainHeader.insertAdjacentElement('beforeend', new hr());

			if (typeof config.navigation === 'object' && Object.keys(config.navigation).length !== 0) {
				const mainNav = new nav();
				const navList = new list();

				for (const navTitle in config.navigation) {
					const navItem = new li();

					if (config.navigation[navTitle]) {
						navItem.insertAdjacentElement('beforeend', new a(config.navigation[navTitle], navTitle, null, config.sitePath));

						navList.insertAdjacentElement('beforeend', navItem);
					}
				}

				mainNav.insertAdjacentElement('beforeend', navList);

				mainHeader.insertAdjacentElement('beforeend', mainNav);

				mainHeader.insertAdjacentElement('beforeend', new hr());
			}

			return mainHeader;
		}

		let renderer = {
			link(href, title, text) {
				const anchor = new a(href, text, title, config.sitePath);

				return anchor.outerHTML;
			}
		};

		const hooks = {
			postprocess(html) {
				return DOMPurify.sanitize(html);
			}
		};

		const head = document.querySelector('head');

		//Add the <title>.
		head.insertAdjacentElement('beforeend', new title(config.name));

		//Add the <meta> description.
		head.insertAdjacentElement('beforeend', new description(config.description));

		const body = document.getElementById('app');

		const router = new Navigo(config.sitePath, {
			hash: true
		});

		router.hooks({
			before: (done, match) => {
				body.innerHTML = '';

				done();
			}
		});

		let posts = [];

		for(let i = 0; i < config.posts.length; i++) {
			let postFile = config.posts[i];
			let postSlug = slugify(postFile);

			posts.push({
				postFile: postFile,
				postSlug: postSlug
			});

			router.on('/' + postSlug, (match) => {
				//Create a header for the page.
				body.insertAdjacentElement('beforeend', mainHeader(match));

				fetch('./posts/' + postFile + '.md')
					.then(response => {
						head.insertAdjacentElement('beforeend', new httpequivStatus(response.status));

						if (response.status !== 200) {
							switch(response.status) {
								case 400:
									throw new Error('400: Bad Request');
								break;
								case 401:
									throw new Error('401: Unauthorized');
								break;
								case 404:
									throw new Error('404: Not Found');
								break;
								case 410:
									throw new Error('410: Gone');
								break;
								case 500:
									throw new Error('500: Internal Server Error');
								break;
							}
						}

						return response.text();
					})
					.then((markdown) => {
						renderer.heading = (text, level)  => {
							return '<h' + level + '>' + text + '</h' + level + '>';
						};

						marked.use({
							renderer: renderer,
							hooks: hooks
						});

						return marked.parse(markdown);
					})
					.then((html) => {
						const newArticle = new article();

						newArticle.innerHTML = html;

						const pageTitle = newArticle.getElementsByTagName('h1')[0].innerText;

						head.getElementsByTagName('title')[0].innerText = pageTitle + ' | ' + config.name;

						head.querySelector("[name=description][content]").content = newArticle.getElementsByTagName('p')[0].innerText.substring(0, 160);

						const breadcrumbs = new list('unordered', 'breadcrumbs');

						const backLink = new a('/', 'Back to the Homepage');

						const firstItem = new li();

						firstItem.insertAdjacentElement('beforeend', backLink)

						breadcrumbs.insertAdjacentElement('beforeend', firstItem);

						const secondItem = new li(pageTitle);

						breadcrumbs.insertAdjacentElement('beforeend', secondItem);

						body.insertAdjacentElement('beforeend', breadcrumbs);

						body.insertAdjacentElement('beforeend', newArticle);
					})
					.catch((error) => {
						const errorPage = new div();

						errorPage.insertAdjacentElement('beforeend', new h(1, error));
						errorPage.insertAdjacentElement('beforeend', new h(2, "Need help finding what you're looking for?"));
						errorPage.insertAdjacentElement('beforeend', new p("If you're having trouble finding what you're looking for:"));

						const solutions = new list('ordered');

						solutions.insertAdjacentElement('beforeend', new li('Make sure your address is correct.'));
						solutions.insertAdjacentElement('beforeend', new li('Refresh the current page.'));
						solutions.insertAdjacentElement('beforeend', new li('Head back to the homepage and try again.'));

						errorPage.insertAdjacentElement('beforeend', solutions);

						body.insertAdjacentElement('beforeend', errorPage);
					});
			});
		}

		router.on('/', (match) => {
			head.insertAdjacentElement('beforeend', new httpequivStatus(200));

			head.getElementsByTagName('title')[0].innerText = config.name;

			head.querySelector("[name=description][content]").content = config.description;

			//Create a header for the page.
			body.insertAdjacentElement('beforeend', mainHeader(match));

			for(let i = 0; i < posts.length; i++) {
				fetch('./posts/' + posts[i].postFile + '.md')
					.then(response => response.text())
					.then((markdown) => {
						renderer.heading = (text, level)  => {
							if (level == 1) {
								var anchor = new a('/' + slugify(text), text, null, config.sitePath);

								text = anchor.outerHTML;
							}

							return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>';
						};

						marked.use({
							renderer: renderer,
							hooks: hooks
						});

						return marked.parse(markdown);
					})
					.then((html) => {
						const newArticle = new article();

						newArticle.innerHTML = html;

						body.insertAdjacentElement('beforeend', newArticle);
					});
			}
		});

		router.resolve();
	});
