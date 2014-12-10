var file = require("../template/filedfadf");
var combinate = require("../template/combinateDoc");
var path = require("path");

var globalMethods = {};//{"egret":["callLater", "clearTimeout"]}
var globalMembers = {};

var classRelations = {};
var moduleList = {};

function addToGolbalMethods(method) {
    if (globalMethods[method["memberof"]] == null) {
        globalMethods[method["memberof"]] = [];
    }

    globalMethods[method["memberof"]].push(method);
}

function addToGolbalMembers(member) {
    if (globalMembers[member["memberof"]] == null) {
        globalMembers[member["memberof"]] = [];
    }

    globalMembers[member["memberof"]].push(member);
}

/**
 * Created by huanghaiying on 14/11/28.
 */
function classFilter(classObj) {
    var keys = [];
    //kind member
    keys.push("kind");
    if (classObj["comment"].indexOf("@interface") >= 0) {
        classObj["kind"] = "interface";
    }

    //name 变量名
    keys.push("name");

    //classdesc 描述
    keys.push("classdesc");

    //memberof 所属包
    keys.push("memberof");

    //augments 继承自哪个类
    keys.push("augments");

    //implements 实现接口
    keys.push("implements");

    classObj["filename"] = classObj["meta"]["filename"];
    //filename
    keys.push("filename");

    //examples
    addExample(classObj, keys);

    //deprecated 是否被遗弃
    keys.push("deprecated");

    for (var m in classObj) {
        if (keys.indexOf(m) < 0) {
            delete classObj[m];
        }
    }

    for (var k in classObj["implements"]) {
        delete classObj["implements"][k]["link"];
    }

    if (classObj["augments"]) {
        classObj["augments"] = classObj["augments"][0];

        classRelations[classObj["memberof"] + "." + classObj["name"]] = classObj["augments"];
    }

    if (moduleList[classObj["memberof"]] == null) {
        moduleList[classObj["memberof"]] = [];
    }
    moduleList[classObj["memberof"]].push(classObj["name"]);

}

function memberFilter(member, fileName) {
    var keys = [];
    //kind member
    keys.push("kind");

    //name 变量名
    keys.push("name");

    //description 描述
    keys.push("description");

    //defaultvalue 默认值
    keys.push("defaultvalue");

    //type 类型
    keys.push("type");

    //memberof 所属类
    keys.push("memberof");

    //scope 变量类型 instance  static
    keys.push("scope");

    //inherits 继承自哪个类
    keys.push("inherits");

    //inherited 是否是继承变量
    keys.push("inherited");

    //examples
    addExample(member, keys);

    //deprecated 是否被遗弃
    keys.push("deprecated");

    if (!member["inherited"]) {//非继承方法
        var n1 = fileName.split(".")[0];

        var fn = member["meta"]["filename"];
        var narr = fn.split("/");
        narr = narr[narr.length - 1].split("\\");
        var n2 = narr[narr.length - 1].split(".")[0];
        if (n1 != n2) {//不属于当前文件
            member["filename"] = fn;
            //filename
            keys.push("filename");

            addToGolbalMembers(member);
        }
    }

    for (var m in member) {
        if (keys.indexOf(m) < 0) {
            delete member[m];
        }
    }

    filterInherits(member);
    filterType(member);
}

function methodFilter(method, fileName) {
    var keys = [];
    //kind member
    keys.push("kind");

    //name 变量名
    keys.push("name");

    //description 描述
    keys.push("description");

    //defaultvalue 默认值
    keys.push("defaultvalue");

    //params 参数
    keys.push("params");

    //type 类型
    if (method["returns"] && method["returns"][0]) {
        method["type"] = method["returns"][0]["type"]["names"][0];

        if (method["type"] == "function") {
            method["type"] = "Function";
        }

        method["returns"] = method["returns"][0];
        method["returns"]["type"] = method["returns"]["type"]["names"][0];

    }
    keys.push("type");
    keys.push("returns");


    //memberof 所属类
    keys.push("memberof");

    //scope 变量类型 instance  static
    keys.push("scope");

    //examples
    addExample(method, keys);

    //inherits 继承自哪个类
    keys.push("inherits");

    //inherited 是否是继承变量
    keys.push("inherited");

    if (!method["inherited"]) {//非继承方法
        var n1 = fileName.split(".")[0];

        var fn = method["meta"]["filename"];
        var narr = fn.split("/");
        narr = narr[narr.length - 1].split("\\");
        var n2 = narr[narr.length - 1].split(".")[0];
        if (n1 != n2) {//不属于当前文件
            method["filename"] = fn;
            //filename
            keys.push("filename");

            addToGolbalMethods(method);
        }
    }

    //deprecated 是否被遗弃
    keys.push("deprecated");

    for (var m in method) {
        if (keys.indexOf(m) < 0) {
            delete method[m];
        }
    }

    filterInherits(method);
    filterParams(method);
}

function addExample(obj, keys) {
    if (obj["examples"] && obj["examples"][0] && obj["examples"][0]["code"]) {
        //examples
        obj["exampleC"] = obj["examples"][0]["code"];
        keys.push("exampleC");
    }

    if (obj["tags"] && obj["tags"][0] && obj["tags"][0]["value"]) {
        //link
        obj["exampleU"] = obj["tags"][0]["value"];
        keys.push("exampleU");
    }
}

function filterParams(obj) {
    for (var key in obj["params"]) {
        var param = obj["params"][key];
        filterType(param);

        if (param.name.indexOf("...") == 0) {
            param["type"] = "";
        }
    }
}

function filterType(obj) {
    if (obj["type"]) {
        obj["type"] = obj["type"]["names"][0];

        if (obj["type"] == "function") {
            obj["type"] = "Function";
        }
    }
}

function filterInherits(obj) {
    if (obj["inherits"]) {
        obj["inherits"] = obj["inherits"].split("#")[0];
    }
}

function fileters(filePath) {
    var fileList = file.getDirectoryListing(filePath, true);

    for (var key in fileList) {
        resetData(filePath, fileList[key]);
    }


    var childrenRelations = {};
    for (var child in classRelations) {
        var parent = classRelations[child];

        if (childrenRelations[parent] == null) {
            childrenRelations[parent] = [];
        }
        childrenRelations[parent].push(child);
    }

    for (var key in moduleList) {
        var classList = moduleList[key];
        classList.sort();

        if (globalMethods[key] != null) {
            classList.unshift("globalFunction");
        }

        if (globalMembers[key] != null) {
            classList.unshift("globalMember");
        }
    }

    file.save(path.join(filePath, "..", "egretDocs", "relation", "egret_extends.json"),
        JSON.stringify({"parent" : classRelations, "children" : childrenRelations}, null, "\t"));

    file.save(path.join(filePath, "..", "egretDocs", "relation", "egret_list.json"),
        JSON.stringify(moduleList, null, "\t"));

    combinate.combinate(path.join(filePath, "..", "egretDocs"));
}

function resetData(filePath, fileName) {
    var fileUrl = path.join(filePath, fileName);

    try {
        var fileData = JSON.parse(file.read(fileUrl));

        var isClass = false;
        for (var key in fileData) {
            var data = fileData[key];
            if (data["kind"] == "class") {
                isClass = true;
                classFilter(data);
            }
            else if (data["kind"] == "member") {
                memberFilter(data, fileName);
            }
            else if (data["kind"] == "function") {
                methodFilter(data, fileName);
            }
        }
    }
    catch (e) {
        console.log(fileUrl + "解析出错!");
    }


    file.save(path.join(filePath, "..", "egretDocs", "classes", fileName), JSON.stringify(fileData, null, "\t"));
}

exports.doc = fileters;