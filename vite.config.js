const { defineConfig } = require('vite')

module.exports = defineConfig({
	root: 'src',
	resolve: {
		preserveSymlinks: true
	},
	build: {
		emptyOutDir: true,
		rollupOptions: {
			input: {
				html: './src/index.html',
				js: './src/js/main.js'
			},
			output: {
				dir: './dist',
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`
			}
		}
	}
});