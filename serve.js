const path = require('path');
const express = require('express');
const app = express();
const port = 3099;

app.use(express.static('www'));

app.listen(port, () => 
{
    console.log(`clsDataTable.js served on port ${port}`)
});