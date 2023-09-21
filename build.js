const fs = require('fs');
const minify = require('@node-minify/core');

let license = '';

fs.readFileSync('LICENSE', 'utf8', (err, data) => 
{
    if (err)
    {
        //console.error(err);
        return;
    }
    license = data;
});

// ToDeleteFromOutputCSS.txt

const classArr = [];
fs.readFile('./src/input.css', 'utf8', (err, data) => 
{
    if (err)
    {
        console.error(err);
        return;
    }


    const classesRegex = /.classList.add.*\)/g;

    data.split('\r\n').forEach((ln) =>
    {
        let match = ln.match(classesRegex);
        if(match)
        {
            console.log(match)
        }
    });

   // classArr = [...];
    
    //console.log(Array.from(data.matchAll(classesRegex)))


});


// src/clsDataTable.js
//classList.add('
//fill cssClasses.json
