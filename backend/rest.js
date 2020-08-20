
const fs = require('fs');
const data = fs.readFileSync('./records.json');
var records = JSON.parse(data);
var bodyParser = require('body-parser')


var express = require('express');
var app = express();

app.use(bodyParser.json())
app.use(express.static('../clientside/build'))


app.get('/api/v1/records', (req, res) => {
res.send(records)
});


app.post('/api/v1/records', (req, res) => 
{   
    res.send(req.body);
    records.push(req.body);
    fs.writeFile('/records.json', JSON.stringify(records), () => {
    console.log(records)
    });
    res.send()
});

app.listen(3001);
