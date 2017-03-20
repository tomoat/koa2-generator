# koa-generator

[Koa'](https://koajs.com) application generator.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Gratipay][gratipay-image]][gratipay-url]

## Installation

```sh
$ npm install -g koa2-generator
```

## Quick Start

The quickest way to get started with koa2 is to utilize the executable `koa2(1)` to generate an application as shown below:

Create the app:

if you use hogan template engine

```bash
$ koa2 --view hogan ./app && cd ./app
```

if you want use yarn manage your application modules
```bash
$ npm i -g yarn 
```

Install dependencies:

```bash
$ npm install
or
$ yarn install
```

Start your Koa app at `http://localhost:3000/`:

```bash
$ npm start
or 
$ yarn start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

Usage: koa2 [options] [dir]
  
  options:

    -h, --help          output usage information
    -v, --version       output the version number
    -e, --ejs           add ejs engine support
        --hbs           add handlebars engine support
        --pug           add pug engine support
        --hjs           add hogan.js engine support
        --njk           add nunjucks engine support
        --view <engine> add view <engine> support (ejs|hbs|hogan|jade|pug|twig|vash) (defaults to jade)
    -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/koa2-generator.svg
[npm-url]: https://npmjs.org/package/koa2-generator
[travis-image]: https://img.shields.io/travis/tomoat/koa2-generator/master.svg?label=linux
[travis-url]: https://travis-ci.org/tomoat/koa2-generator
[appveyor-image]: https://img.shields.io/appveyor/ci/tomoat/koa2-generator/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/tomoat/koa2-generator
[downloads-image]: https://img.shields.io/npm/dm/koa2-generator.svg
[downloads-url]: https://npmjs.org/package/koa2-generator
[gratipay-image]: https://img.shields.io/gratipay/tomoat.svg
[gratipay-url]: https://gratipay.com/tomoat/
