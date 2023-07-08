const fs = require('fs');
const minify = require('@node-minify/core');
const cleanCSS = require('@node-minify/clean-css');
const babelMinify = require('@node-minify/babel-minify');
const gcc = require('@node-minify/google-closure-compiler');
const uglifyJS = require('@node-minify/uglify-js');

let license = '';

fs.readFile('LICENSE', 'utf8', (err, data) => 
{
    if (err)
    {
        //console.error(err);
        return;
    }
    license = data;
    minifyFiles();
});

function minifyFiles()
{
    minify({
        compressor: uglifyJS,
        comments: 'all',
        input: 'clsDataTable.js',
        output: 'dist/clsDataTable.js',
        replaceInPlace: true,
        type: 'js',
        options: {
            output: {},
            compress: true,
            annotations: true,
            mangle: true,
            output: {
                beautify: false,
                preamble: '/*\n' + license + '\n*/'
            }
        },
    }).then(function (min) 
    {

    });

    minify({
        compressor: cleanCSS,
        input: 'dist/clsDataTable.css',
        output: 'dist/clsDataTable.css',
        replaceInPlace: true,
        type: 'css',
        options: {
            comments: 'all',
            annotations: true,
            warnings: true,
            mangle: true,
            output: {},
            compress: true,
            output: {
                beautify: false,
                preamble: '/***\n' + license + '\n***/'
            }
        },
    }).then(function (min) 
    {

    });
}