var XLSX = require('xlsx');
var fs = require('fs');
var workbook = XLSX.readFile('settings.xlsx');
/* DO SOMETHING WITH workbook HERE */

if( workbook !== undefined ) {
	console.log('hahaha');

	//console.log(workbook.Sheets["Sheet1"]);

	var csv = XLSX.utils.sheet_to_csv(workbook.Sheets["Sheet1"], '/');
	fs.writeFileSync("settings.csv", csv, "utf8");

	//console.log(csv);
}