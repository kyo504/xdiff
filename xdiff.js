var fs = require("fs");
var xml2js = require("xml2js");
var parser = new xml2js.Parser();
//var parseString = require("xml2js").parseString;

var oldFileName, newFileName, resultFileName;
var oldData, newData, resultData;
var bShowChange = false;    

var xDiffVersion = "0.0.1";
var oldFileList, newFileList;
var option;
var oldFolderName = "", newFolderName = "", resultFolderName = "";
// process.stdin.setEncoding('utf8');

// process.stdin.on('readable', function() {
//   var chunk = process.stdin.read();
//   if (chunk !== null) {
//     console.log("11111111111");
//     process.stdout.write('data: ' + chunk);
//   }
// });

// process.stdin.on('end', function() {
//     console.log("222222222");
//     process.stdout.write('end');
// });

process.argv.forEach(function (val, index, array) {

    if(val === "--version" || val === "-v"){
        displayVersion();
        process.exit();
    }else if( val === "--help" || val === "-h"){
        displayHelp();
        process.exit();
    }

    if (index == 2) {
        if (val == "-d") {
            option = "comparefolders"
        } else if(val == "-f"){
            option = "comparefiles"
        }
    } else if (index == 3) {
        if (option == "comparefolders") {
            console.log("old directory name : " + val);
            oldFolderName = val;
        } else if (option == "comparefiles") {
            console.log("Old file name : " + val);
            oldFileName = val;
        }
    } else if (index == 4) {
        if (option == "comparefolders") {
            console.log("New directory name : " + val);
            newFolderName = val;
        } else if (option == "comparefiles") {
            console.log("New file name : " + val);
            newFileName = val;
        }
    } else if (index == 5) {
        if (option == "comparefolders") {
            console.log("result directory name : " + val);
            resultFolderName = val;
            compareFolders(oldFolderName, newFolderName);
        } else if (option == "comparefiles") {
            console.log("Result file name : " + val);
            resultFileName = val;
            loadOldFile();
        }
    } else {
        console.log("ERROR...");
    }

});

function compareFolders(oldFolderName, newFolderName) {
    oldFileList = fs.readdirSync(oldFolderName);
    newFileList = fs.readdirSync(newFolderName);
    // if(!oldFileName || !newFolderName) {
    //     console.log("There is no oldFolderName.");
    //     return;
    // }

    for(var i=0; i<oldFileList.length; i++) {
        oldFileName = "";
        newFileName = "";
        resultFileName = "";

        for(var j=0; j<newFileList.length; j++) {
            if (oldFileList[i] == newFileList[j]) {
                oldFileName = oldFileList[i];
                newFileName = oldFileName;
                resultFileName = oldFileName;
                loadOldFile();
                break;
            }
        }
    }
};

function displayVersion() {
    console.log("xDiff version : " + xDiffVersion);
};

function displayHelp() {
    console.log("Usage: xdiff old_xliff_name new_xliff_name result_xliff_name");
    console.log("-v or --version : show current version of xdiff");
    console.log("-h or --help : show how to use this app")
};

function loadOldFile() {
    console.log("Load old file : " + oldFileName);
    // fs.readFile(oldFileName, "utf8", function(err, data) {
    //     oldData = parser.parseString(data);
    // });

    parser.parseString(fs.readFileSync(oldFolderName+oldFileName, "utf8"), function(err, data) {
        oldData = data;
        loadNewFile();
    });

    // parser(fs.readFileSync(oldFileName, "utf8"), function(err, result) {
    //     oldData = result;
    //     loadNewFile();
    // })
};

function loadNewFile() {
    console.log("Load new file : " + newFileName);
    parser.parseString(fs.readFileSync(newFolderName+newFileName, "utf8"), function(err, data) {
        newData = data;

        console.time('processTime');
        compareFiles();
        console.timeEnd('processTime');
    });

    // fs.readFile(newFileName, "utf8", function(err, data) {
    //     parseString(data, function (err, result) {
    //         newData = result;

    //         console.time('processTime');
    //         compareFiles();
    //         console.timeEnd('processTime');
    //     });
    // });

    // parseString(fs.readFileSync(newFileName, "utf8", function(err, data) {
    //     newData = result;

    //     console.time('processTime');
    //     compareFiles();
    //     console.timeEnd('processTime');        
    // }));
};

function saveResult() {
    fs.writeFileSync(resultFolderName+resultFileName, resultData, "utf8");
};

function compareFiles() {
    
    // console.log(oldData.xliff.file.length);
    // console.log(oldData.xliff.file[0].$['target-language']);
    // console.log(oldData.xliff.file[0].body[0]['trans-unit'].length);
    // console.log(oldData.xliff.file[0].body[0]['trans-unit'][50].$.id);
    // console.log(oldData.xliff.file[0].body[0]['trans-unit'][50].source[0]._);
    // console.log(oldData.xliff.file[0].body[0]['trans-unit'][50].target[0]);
    // console.log(typeof oldData.xliff.file[0].body[0]['trans-unit'][50].source[0]);
    // console.log(typeof oldData.xliff.file[0].body[0]['trans-unit'][50].target[0]);
    
    var i, j, k, l, m, n;
    var datatype, original, srcLang, tgtLang;
    var found;
    var unit;
    var str;
    
    resultData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE xliff PUBLIC \"-//XLIFF//DTD XLIFF//EN\" \"http://www.oasis-open.org/committees/xliff/documents/xliff.dtd\">\n"
    resultData += "<xliff version=\"1.2\">\n"

    l = oldData.xliff.file.length;
    
    for (i = 0; i < l; i++) {
        datatype = oldData.xliff.file[i].$.datatype;
        original = oldData.xliff.file[i].$.original;
        srcLang = oldData.xliff.file[i].$["source-language"];
        tgtLang = oldData.xliff.file[i].$["target-language"];

        m = newData.xliff.file.length;
        found = false;
        for (j = 0; j < m; j++) {
            if ((original == newData.xliff.file[j].$.original) && (datatype == newData.xliff.file[j].$.datatype) &&
                (srcLang == newData.xliff.file[j].$["source-language"]) && (tgtLang == newData.xliff.file[j].$["target-language"])) {

                resultData += compareXliffFiles(oldData.xliff.file[i], newData.xliff.file[j]);
                newData.xliff.file.splice(j, 1); // why? 
                found = true;
                break;
            }
        }
        
        // 만약 동일한 파일을 찾지 못하면, 삭제된 것으로 간주하고 
        // oldData의 내용으로 채운다.
        if (found == false) {
            resultData += "    <file datatype=\"" + datatype + "\"";
            resultData += " original=\"" + original + "\"";
            resultData += " source-language=\"" + oldData.xliff.file[i].$["source-language"] + "\"";
            resultData += " target-language=\"" + oldData.xliff.file[i].$["target-language"] + "\">\n";
            resultData += "        <body>\n"
            n = oldData.xliff.file[i].body[0]["trans-unit"].length;
            for (k = 0; k < n; k++) {
                unit = oldData.xliff.file[i].body[0]["trans-unit"][k];
                resultData += stringifyUnit(unit, null, "removed");
            }
            resultData += "        </body>\n"
            resultData += "    </file>\n";
        }
    }
    
    // After deleting matched data, remaining data will be added to result data!!
    l = newData.xliff.file.length;
    for (i = 0; i < l; i++) {
        resultData += "    <file datatype=\"" + newData.xliff.file[i].$.datatype + "\"";
        resultData += " original=\"" + newData.xliff.file[i].$.original + "\"";
        resultData += " source-language=\"" + newData.xliff.file[i].$["source-language"] + "\"";
        resultData += " target-language=\"" + newData.xliff.file[i].$["target-language"] + "\">\n";
        resultData += "        <body>\n"
        n = newData.xliff.file[i].body[0]["trans-unit"].length;
        for (k = 0; k < n; k++) {
            unit = newData.xliff.file[i].body[0]["trans-unit"][k];
            resultData += stringifyUnit(null, unit,"added");
        }
        resultData += "        </body>\n"
        resultData += "    </file>\n";
    }
    
    resultData += "</xliff>";
    
    saveResult();
}

function compareXliffFiles(oldXliffFile, newXliffFile) {
    var results = "";
    var modifiedOld = [];
    var modified = [];
    var added = [];
    var removed = [];
    var i, j, l, m;
    var oldSource, oldKey, oldTarget, newKey, newSource, newTarget;
    var found;
    
    l = oldXliffFile.body[0]["trans-unit"].length;
    for (i = 0; i < l; i++) {
        oldSource   = "";
        oldKey      = "";

        // if datatype is 'x-qml'
        // if datatype is others...
        



        if (typeof oldXliffFile.body[0]["trans-unit"][i].source[0] == "object") {
            oldSource   = oldXliffFile.body[0]["trans-unit"][i].source[0]._;
            oldKey      = oldXliffFile.body[0]["trans-unit"][i].source[0].$["x-key"];
        } else {
            if(oldXliffFile.$.datatype == "x-qml"){
                oldSource   = oldXliffFile.body[0]["trans-unit"][i].source[0];
                oldKey      = oldXliffFile.body[0]["trans-unit"][i].$["x-disambiguation"] ? oldXliffFile.body[0]["trans-unit"][i].$["x-disambiguation"] : "";
            }else{
                oldSource = oldXliffFile.body[0]["trans-unit"][i].source[0];
            }
        }
        
        m = newXliffFile.body[0]["trans-unit"].length;
        found = false;
        for (j = 0; j < m; j++) {
            newSource = "";
            newKey = "";

            if (typeof newXliffFile.body[0]["trans-unit"][j].source[0] == "object") {
                newSource   = newXliffFile.body[0]["trans-unit"][j].source[0]._;
                newKey      = newXliffFile.body[0]["trans-unit"][j].source[0].$["x-key"];
            } else {
                if(newXliffFile.$.datatype == "x-qml"){
                    //console.log("oldSource : " + oldXliffFile.body[0]["trans-unit"][i].source[0]);
                    //console.log("newSource : " + newXliffFile.body[0]["trans-unit"][j].source[0]);


                    newSource   = newXliffFile.body[0]["trans-unit"][j].source[0];
                    newKey      = newXliffFile.body[0]["trans-unit"][j].$["x-disambiguation"] ? newXliffFile.body[0]["trans-unit"][j].$["x-disambiguation"] : "";
                }else{
                    newSource = newXliffFile.body[0]["trans-unit"][j].source[0];
                }
            }


            if ((oldSource == newSource) && (oldKey == newKey)) {
                found = true;
                oldTarget = "";
                if (typeof oldXliffFile.body[0]["trans-unit"][i].target[0] == "object") {
                    oldTarget = oldXliffFile.body[0]["trans-unit"][i].target[0]._;
                } else {
                    oldTarget = oldXliffFile.body[0]["trans-unit"][i].target[0];
                }
                newTarget = "";
                if (typeof newXliffFile.body[0]["trans-unit"][j].target[0] == "object") {
                    newTarget = newXliffFile.body[0]["trans-unit"][j].target[0]._;
                } else {
                    newTarget = newXliffFile.body[0]["trans-unit"][j].target[0];
                }
                if (oldTarget != newTarget) {
                    modifiedOld.push(oldXliffFile.body[0]["trans-unit"][i]);
                    modified.push(newXliffFile.body[0]["trans-unit"][j]);
                }
                newXliffFile.body[0]["trans-unit"].splice(j, 1)
                break;
            }
        }
        
        if (found == false) {
            removed.push(oldXliffFile.body[0]["trans-unit"][i]);
        }
    }
    
    l = newXliffFile.body[0]["trans-unit"].length;
    for (i = 0; i < l; i++) {
        added.push(newXliffFile.body[0]["trans-unit"][i]);
    }
    
    if (modified.length + added.length + removed.length > 0) {
        results += "    <file datatype=\"" + oldXliffFile.$.datatype + "\"";
        results += " original=\"" + oldXliffFile.$.original + "\"";
        results += " source-language=\"" + oldXliffFile.$["source-language"] + "\"";
        results += " target-language=\"" + oldXliffFile.$["target-language"] + "\">\n";
        results += "        <body>\n"
    }
    
    if (modified.length > 0) {
        l = modified.length;
        for (i = 0; i < l; i++) {
            results += stringifyUnit(modifiedOld[i], modified[i], "modified");
        }
    }
    
    if (added.length > 0) {
        l = added.length;
        for (i = 0; i < l; i++) {
            results += stringifyUnit(null, added[i], "added");
        }
    }
    
    if (removed.length > 0) {
        l = removed.length;
        for (i = 0; i < l; i++) {
            results += stringifyUnit(removed[i], null, "removed");
        }
    }
    
    if (modified.length + added.length + removed.length > 0) {
        results += "        </body>\n"
        results += "    </file>\n";
    }
    
    return results;
}

function stringifyUnit(oldUnit, newUnit, state) {
    var results, str;
    var unit;
    results = "";

    if (state == "added") {
        unit = newUnit;
    } else if (state == "removed") {
        unit = oldUnit;
    } else if (state == "modified") {
        unit = oldUnit;
    } else {
        console.log("No state value : " + state);
        return;
    }

    if (!unit.$) {
        return ;
    }

    if (unit.$["x-disambiguation"]) {
        results += "            <trans-unit id=\"" + unit.$.id + "\" state=\"" + state + " \" x-disambiguation=\"" + unit.$["x-disambiguation"] +"\">\n";
    } else {
        results += "            <trans-unit id=\"" + unit.$.id + "\" state=\"" + state + "\">\n";
    }

    // Source
    if( (typeof unit.source[0] == "object") && unit.source[0].$["x-key"]) {
        results += "                <source " + "x-key=\"" + unit.source[0].$["x-key"] + "\">"
    } else {
        results += "                <source>"
    }

    if (typeof unit.source[0] == "object") {
        str = unit.source[0]._;
    } else {
        str = unit.source[0];
    }
    str = str.replace(/&/gi, "&amp;");
    str = str.replace(/</gi, "&lt;");
    str = str.replace(/>/gi, "&gt;");
    /*
    str = str.replace("&", "&amp;");
    str = str.replace("<", "&lt;");
    str = str.replace(">", "&gt;");
    */
    results += str + "</source>\n"

    if( state == "added" ) {
        // Before
        results += "                <target-before>"
        str = "";
        results += str + "</target-before>\n"

        // After  
        results += "                <target-after>"
        if (typeof unit.target[0] == "object") {
            str = unit.target[0]._;
        } else {
            str = unit.target[0];
        }
        str = str.replace(/&/gi, "&amp;");
        str = str.replace(/</gi, "&lt;");
        str = str.replace(/>/gi, "&gt;");
        results += str + "</target-after>\n"

    } else if (state == "removed") {
        // Before target is changed 
        results += "                <target-before>"
        if (typeof unit.target[0] == "object") {
            str = unit.target[0]._;
        } else {
            str = unit.target[0];
        }
        str = str.replace(/&/gi, "&amp;");
        str = str.replace(/</gi, "&lt;");
        str = str.replace(/>/gi, "&gt;");
        results += str + "</target-before>\n"

        // Before
        results += "                <target-after>"
        str = "";
        results += str + "</target-after>\n"
    } else {//if( state == "modified" ){
        // Before target is changed 
        results += "                <target-before>"
        if (typeof unit.target[0] == "object") {
            str = unit.target[0]._;
        } else {
            str = unit.target[0];
        }
        str = str.replace(/&/gi, "&amp;");
        str = str.replace(/</gi, "&lt;");
        str = str.replace(/>/gi, "&gt;");
        results += str + "</target-before>\n"

        // After target is changed
        results += "                <target-after>"
        if (typeof newUnit.target[0] == "object") {
            str = newUnit.target[0]._;
        } else {
            str = newUnit.target[0];
        }
        str = str.replace(/&/gi, "&amp;");
        str = str.replace(/</gi, "&lt;");
        str = str.replace(/>/gi, "&gt;");
        results += str + "</target-after>\n"
    }


    // If there is note tag, attach it to results.
    if (unit.note) {
        results += "                <note>"
        if (typeof unit.note[0] == "object") {
            str = unit.note[0]._;
        } else {
            str = unit.note[0];
        }
        str = str.replace("&", "&amp;");
        str = str.replace("<", "&lt;");
        str = str.replace(">", "&gt;");
        results += str + "</note>\n"
    }
    results += "            </trans-unit>\n"

    return results;
}
