import '../css/stylesheet.scss';

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Navigo from 'navigo';

import { title, description } from './meta';
import { h, header } from './header';
import { slugify } from './helper';
import { a, article, div, li, list } from './body';

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
		const getRenderer = (route) => {
			let renderer = {
				link(href, title, text) {
					const anchor = new a(href, text, title, config.sitePath);

					return anchor.outerHTML;
				}
			};

			//If the url of the route is empty or the root.
			if (route.url == '' || route.url == '/') {
				renderer.heading = (text, level)  => {
					if (level == 1) {
						var anchor = new a('/' + slugify(text), text, null, config.sitePath);

						text = anchor.outerHTML;
					}

					return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>';
				};
			} else {
				renderer.heading = (text, level)  => {
					return '<h' + level + '>' + text + '</h' + level + '>';
				};
			}

			console.log(renderer);

			return renderer;
		}

		const hooks = {
			postprocess(html) {
				return DOMPurify.sanitize(html);
			}
		};

		const head = document.querySelector('head');
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
				fetch('./posts/' + postFile + '.md')
					.then(response => response.text())
					.then((markdown) => {
						marked.use({
							renderer: getRenderer(match),
							hooks: hooks
						});

						return marked.parse(markdown);
					})
					.then((html) => {
						const newArticle = new article();

						newArticle.innerHTML = html;

						const breadcrumbs = new list('unordered', 'breadcrumbs');

						const backLink = new a('/', 'Back to the Homepage');

						const firstItem = new li();

						firstItem.insertAdjacentElement('beforeend', backLink)

						breadcrumbs.insertAdjacentElement('beforeend', firstItem);

						const secondItem = new li(newArticle.getElementsByTagName('h1')[0].innerText);

						breadcrumbs.insertAdjacentElement('beforeend', secondItem);

						body.insertAdjacentElement('beforeend', breadcrumbs);

						body.insertAdjacentElement('beforeend', newArticle);
					});
			});
		}

		router.on('/', (match) => {
			//Add the <title>.
			head.insertAdjacentElement('beforeend', new title(config.name));

			//Add the <meta> description.
			head.insertAdjacentElement('beforeend', new description(config.description));

			//Create a header.
			const rootHeader = new header();

			rootHeader.insertAdjacentElement('beforeend', new h(1, config.name));
			rootHeader.insertAdjacentElement('beforeend', new h(2, config.tagline));

			body.insertAdjacentElement('beforeend', rootHeader);

			for(let i = 0; i < posts.length; i++) {
				fetch('./posts/' + posts[i].postFile + '.md')
					.then(response => response.text())
					.then((markdown) => {
						marked.use({
							renderer: getRenderer(match),
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
