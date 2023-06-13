# MicroMage
PxO Ink LLC

This is an exercise in using Vite, Sass, Markdown, and Navigo to build a microblogging platform.

## Configuration

To configure the application, modify the `dist/config.json` file.

## Adding a post.

1. Plan the name of your post and the appropriate slug in advanced. You can use the `dist/posts/hello-world.md` file as an example.
2. Create your `example-post-slug.md` file in the `dist/posts` folder.
3. Change your `dist/config.json` to add the `example-post-slug` to the `posts` array.

## Build commands

### One-Time Build

`npm run build`

### Ongoing Watch

`npm run watch`

### Self-Hosted Version

`npm run preview`

## Uploading your build.

Simply point your web server's publicly accessible webroot to the `dist` folder, or upload the contents of the `dist` folder to your publicly accessible webroot.

## License

See LICENSE file.
