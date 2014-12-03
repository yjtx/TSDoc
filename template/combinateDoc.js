var file = require("../template/filedfadf");
var path = require("path");

var globalMethods = {};//{"egret":["callLater", "clearTimeout"]}
var globalMembers = {};

var currentDir = "";

//加载类关系
var classRelations = {};
function loadRelations() {
    var content = file.read(path.join(currentDir, "relation", "egret_extends.json"));
    classRelations = JSON.parse(content);
}

function loadClass(fileName) {
    var currentFuncArr = [];
    var extendsFuncArr = [];

    var currentGFuncArr = [];
    var extendsGFuncArr = [];

    var currentMemArr = [];
    var extendsMemArr = [];

    var currentGMemArr = [];
    var extendsGMemArr = [];

    var classData = {};

    var fileContent = file.read(path.join(currentDir, "classes", fileName));
    var fileData = JSON.parse(fileContent);

    for (var key in fileData) {
        var info = fileData[key];
        if (info["kind"] == "class") {
            classData = info;
            var parents = [];

            var child = info["memberof"] + "." + key;
            while (classRelations["parent"][child]) {
                parents.push(classRelations["parent"][child]);
                child = classRelations["parent"][child];
            }

            if (parents.length > 0) {
                info["augments"] = parents;
            }
        }
        else if (info["kind"] == "member") {
            if (info["scope"] == "instance") {
                if (info["inherits"]) {
                    extendsMemArr.push(info);
                }
                else {
                    currentMemArr.push(info);
                }
            }
            else {
                if (info["inherits"]) {
                    extendsGMemArr.push(info);
                }
                else {
                    currentGMemArr.push(info);
                }
            }

        }
        else if (info["kind"] == "function") {
            if (info["scope"] == "instance") {
                if (info["inherits"]) {
                    extendsFuncArr.push(info);
                }
                else {
                    currentFuncArr.push(info);
                }
            }
            else {
                if (info["inherits"]) {
                    extendsGFuncArr.push(info);
                }
                else {
                    currentGFuncArr.push(info);
                }
            }


        }
    }

    currentMemArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    extendsMemArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    currentGMemArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    extendsGMemArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    currentFuncArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    extendsFuncArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    currentGFuncArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});
    extendsGFuncArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});

    if (classRelations["list"][fileName.replace(".json", "")]) {//模块

        var resultData = {};
        addToObject(resultData, "cgf", currentGFuncArr);
        addToObject(resultData, "egf", extendsGFuncArr);
        file.save(path.join(currentDir, "finalClasses", fileName.replace(".json", ".globalFunction.json")), JSON.stringify(resultData, null, "\t"));

        var resultData = {};
        addToObject(resultData, "cgm", currentGMemArr);
        addToObject(resultData, "egm", extendsGMemArr);
        file.save(path.join(currentDir, "finalClasses", fileName.replace(".json", ".globalMember.json")), JSON.stringify(resultData, null, "\t"));
    }
    else {
        var resultData = {  "class" : classData};
        addToObject(resultData, "cm", currentMemArr);
        addToObject(resultData, "em", extendsMemArr);
        addToObject(resultData, "cgm", currentGMemArr);
        addToObject(resultData, "egm", extendsGMemArr);
        addToObject(resultData, "cf", currentFuncArr);
        addToObject(resultData, "ef", extendsFuncArr);
        addToObject(resultData, "cgf", currentGFuncArr);
        addToObject(resultData, "egf", extendsGFuncArr);


        file.save(path.join(currentDir, "finalClasses", fileName), JSON.stringify(resultData, null, "\t"));
    }
}

function addToObject(obj, type, array) {
    if (array.length) {
        obj[type] = array;
    }
}

function combinate(filePath) {//egretDocs
    currentDir = filePath;
    loadRelations();

    var fileList = file.getDirectoryListing(path.join(filePath, "classes"), true);
    for (var key in fileList) {
        loadClass(fileList[key]);
    }
}


exports.combinate = combinate;