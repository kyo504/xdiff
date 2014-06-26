var fs = require("fs");
var parseString = require("xml2js").parseString;

var oldFileName, newFileName, resultFileName;
var oldData, newData, resultData;
var bShowChange = false;    

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        console.log("Old file name : " + val);
        oldFileName = val;
    } else if (index == 3) {
        console.log("New file name : " + val);
        newFileName = val;
    } else if (index == 4) {
        console.log("Result file name : " + val);
        resultFileName = val;
        loadOldFile();
    } else if (index == 5){
        console.log("Show before and after : " + val);
        if( val === "-c" ){
            console.log("Now user can see before and after on target field.")
            bShowChange = true;
        }
    } else{
        console.log("Why here??");
    }
});

function loadOldFile() {
    console.log("Load old file");
    fs.readFile(oldFileName, "utf8", function(err, data) {
        parseString(data, function (err, result) {
            oldData = result;
            loadNewFile();
        });
    });
};

function loadNewFile() {
    console.log("Load new file");
    fs.readFile(newFileName, "utf8", function(err, data) {
        parseString(data, function (err, result) {
            newData = result;
            compareFiles();
        });
    });
};

function saveResult() {
    fs.writeFile(resultFileName, resultData, "utf8");
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
    var datatype, original;
    var found;
    var unit;
    var str;
    
    resultData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE xliff PUBLIC \"-//XLIFF//DTD XLIFF//EN\" \"http://www.oasis-open.org/committees/xliff/documents/xliff.dtd\">\n"

    l = oldData.xliff.file.length;
    
    for (i = 0; i < l; i++) {
        datatype = oldData.xliff.file[i].$.datatype;
        original = oldData.xliff.file[i].$.original;
        m = newData.xliff.file.length;
        found = false;
        for (j = 0; j < m; j++) {
            if ((original == newData.xliff.file[j].$.original) && (datatype == newData.xliff.file[j].$.datatype)) {
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
                resultData += stringuifyUnit(unit, "removed");
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
            resultData += stringuifyUnit(unit, "added");
        }
        resultData += "        </body>\n"
        resultData += "    </file>\n";
    }
    
    resultData += "</xml>";
    
    saveResult();
}

function compareXliffFiles(oldXliffFile, newXliffFile) {
    var results = "";
    var modified = [];
    var added = [];
    var removed = [];
    var i, j, l, m;
    var oldSource, oldTarget, newSource, newTarget;
    var found;
    
    l = oldXliffFile.body[0]["trans-unit"].length;
    for (i = 0; i < l; i++) {
        oldSource = "";
        if (typeof oldXliffFile.body[0]["trans-unit"][i].source[0] == "object") {
            oldSource = oldXliffFile.body[0]["trans-unit"][i].source[0]._;
        } else {
            oldSource = oldXliffFile.body[0]["trans-unit"][i].source[0];
        }
        
        m = newXliffFile.body[0]["trans-unit"].length;
        found = false;
        for (j = 0; j < m; j++) {
            newSource = "";
            if (typeof newXliffFile.body[0]["trans-unit"][j].source[0] == "object") {
                newSource = newXliffFile.body[0]["trans-unit"][j].source[0]._;
            } else {
                newSource = newXliffFile.body[0]["trans-unit"][j].source[0];
            }
            if (oldSource == newSource) {
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
            results += stringuifyUnit(modified[i], "modified");
        }
    }
    
    if (added.length > 0) {
        l = added.length;
        for (i = 0; i < l; i++) {
            results += stringuifyUnit(added[i], "added");
        }
    }
    
    if (removed.length > 0) {
        l = removed.length;
        for (i = 0; i < l; i++) {
            results += stringuifyUnit(removed[i], "removed");
        }
    }
    
    if (modified.length + added.length + removed.length > 0) {
        results += "        </body>\n"
        results += "    </file>\n";
    }
    
    return results;
}

function stringuifyUnit(unit, state) {
    var results, str;
    results = "";
    if (unit.$ && unit.$.id) {
        results += "            <trans-unit id=\"" + unit.$.id + "\" state=\"" + state + "\">\n";
    } else {
        results += "            <trans-unit  state=\"" + state + "\">\n"
    }
    results += "                <source>"
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
    results += "                <target>"
    if (typeof unit.target[0] == "object") {
        str = unit.target[0]._;
    } else {
        str = unit.target[0];
    }
    str = str.replace(/&/gi, "&amp;");
    str = str.replace(/</gi, "&lt;");
    str = str.replace(/>/gi, "&gt;");
    /*
    str = str.replace("&", "&amp;");
    str = str.replace("<", "&lt;");
    str = str.replace(">", "&gt;");
    */
    results += str + "</target>\n"
    if (unit.note) {
        results += "                <note>"
        if (typeof unit.note[0] == "object") {
            str = unit.note[0]._;
        } else {
            str = unit.note[0];
        }
        str = str.replace("&", "&amp;");
        str = str.replace("&", "&amp;");
        str = str.replace("&", "&amp;");
        str = str.replace("<", "&lt;");
        str = str.replace("<", "&lt;");
        str = str.replace("<", "&lt;");
        str = str.replace(">", "&gt;");
        str = str.replace(">", "&gt;");
        str = str.replace(">", "&gt;");
        results += str + "</note>\n"
    }
    results += "            </trans-unit>\n"
    return results;
}

