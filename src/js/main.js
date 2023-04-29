import '../css/stylesheet.scss';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { title, description } from './meta';
import { h, header } from './header';
import { slugify } from './helper';
import { article } from './body';

marked.setOptions({
	headerIds: false
});

fetch('./config.json').then(response => response.json())
	.then((config) => {
		const head = document.querySelector('head');
		const app = document.getElementById('app');

		//Add the <title>.
		head.insertAdjacentElement('beforeend', new title(config.name));

		//Add the <meta> description.
		head.insertAdjacentElement('beforeend', new description(config.description));

		//Create a header.
		const rootHeader = new header();

		rootHeader.insertAdjacentElement('beforeend', new h(1, config.name));
		rootHeader.insertAdjacentElement('beforeend', new h(2, config.tagline));

		app.insertAdjacentElement('beforeend', rootHeader);

		for(let i = 0; i < config.posts.length; i++) {
			let postFile = config.posts[i];
			let postSlug = slugify(postFile);


			fetch('./posts/' + postFile + '.md')
				.then(response => response.text())
				.then((markdown) => {
					//For markdown on the homepage, we need to increment headings using walkTokens.
					marked.use({
						walkTokens: (token) => {
							if (token.type === 'heading') {
								token.depth += 1;
							}
						},
						hooks: {
							postprocess(html) {
								return DOMPurify.sanitize(html);
							}
						}
					});

					return marked.parse(markdown)
				})
				.then((html) => {
					const newArticle = new article();

					newArticle.innerHTML = html;

					app.insertAdjacentElement('beforeend', newArticle);
				});
		}
	});
