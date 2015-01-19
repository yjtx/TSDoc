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

    var content = file.read(path.join(currentDir, "relation", "egret_list.json"));
    classRelations.list = JSON.parse(content);
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
        if (info["kind"] == "class" || info["kind"] == "interface") {
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

            if (classRelations["children"][info["memberof"] + "." + key]) {
                info["children"] = classRelations["children"][info["memberof"] + "." + key];
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
                info.kind = "globalMember";
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
                info.kind = "globalFunction";
            }


        }
    }

    var memberArr = currentMemArr.concat(extendsMemArr);
    memberArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});

    var gMemberArr = currentGMemArr.concat(extendsGMemArr);
    gMemberArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});

    var funcArr = currentFuncArr.concat(extendsFuncArr);
    funcArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});

    for (var i = 0; i < funcArr.length; i++) {
        if (funcArr[i]["name"] == "constructor") {
            funcArr[i]["name"] = classData["name"];
            var info = funcArr[i];
            funcArr.splice(i, 1);
            funcArr.unshift(info);
            delete info["inherits"];
            delete info["inherited"];
            break;
        }
    }

    var gFuncArr = currentGFuncArr.concat(extendsGFuncArr);
    gFuncArr.sort(function(a,b){return a["name"]>b["name"]?1:-1});

    if (classRelations["list"][fileName.replace(".json", "")]) {//模块
        var resultData = {};
        addToObject(resultData, "globalFunction", gFuncArr);
        file.save(path.join(currentDir, "finalClasses", fileName.replace(".json", ".globalFunction.json")), JSON.stringify(resultData, null, "\t"));

        var resultData = {};
        addToObject(resultData, "globalMember", gMemberArr);
        file.save(path.join(currentDir, "finalClasses", fileName.replace(".json", ".globalMember.json")), JSON.stringify(resultData, null, "\t"));
    }
    else {
        var resultData = {  "class" : classData};
        addToObject(resultData, "member", memberArr);
        addToObject(resultData, "function", funcArr);
        addToObject(resultData, "globalMember", gMemberArr);
        addToObject(resultData, "globalFunction", gFuncArr);


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

    file.remove(path.join(currentDir, "finalClasses"));

    var fileList = file.getDirectoryListing(path.join(filePath, "classes"), true);
    for (var key in fileList) {
        loadClass(fileList[key]);
    }
}


exports.combinate = combinate;