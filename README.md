# WCEU Datavis Examples

Example code for the talk I gave at WCEU 2017, slides available at [talks.kadamwhite.com/wceu2017](http://kadamwhite.github.io/talks/2017/wceu)

## Installation

This project depends on Node 6.6 or greater, and uses [Webpack](https://webpack.js.org/) and [webpack-dev-server](https://github.com/webpack/webpack-dev-server) for bundling & development.

To install, run `npm install` within the project directory.

## Package Commands

- `npm run build`: Build the code into a development bundle
- `npm run build:prod`: Build the code into a production-oriented bundle
- `npm test`: Run the unit tests using [Jest](https://facebook.github.io/jest/)
- `npm run lint`: Lint the code with [ESLint](http://eslint.org/)

## Storybook

[React Storybook](https://getstorybook.io/) is available to assist with UI development.

- `storybook`: Run the storybook at [localhost:6006](http://localhost:6006)
- `build-storybook`: Build a [static version of your storybook](https://getstorybook.io/docs/react-storybook/basics/exporting-storybook)
