var fs = require("fs");
var xml2js = require("xml2js");
var parser = new xml2js.Parser();
var json2csv = require('json2csv');
var jsonData, jsonText;

parser.parseString(fs.readFileSync("./old/sample_old.xliff", "utf8"), function(err, data) {

    jsonText = JSON.stringify(data);

    fs.writeFileSync("./test.json", jsonText);
})