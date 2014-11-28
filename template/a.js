/**
 * Created by huanghaiying on 14/11/27.
 */
function egret_log(obj) {
}


var that = this;

if (this.navOptions.theme === "darkstrap") {
} else {
}
this.searchMembers = [];


var findCls = -1;
for (var rr = 0; rr < this.nav.topLevelNav.length; rr++) {
    if (this.nav.topLevelNav[rr].title == "Classes") {
        findCls = this.nav.topLevelNav[rr];
        break;
    }
}
var findInter = -1;
for (var rr = 0; rr < this.nav.topLevelNav.length; rr++) {
    if (this.nav.topLevelNav[rr].title == "Interfaces") {
        findInter = this.nav.topLevelNav[rr];
        break;
    }
}


var interfaces = [];
var klasses = [];


for (var tt = 0; tt < findCls.members.length; tt++) {

    if (findCls.members[tt].namespace.tags != undefined) {
        var found = false;
        for (var yy = 0; yy < findCls.members[tt].namespace.tags.length; yy++) {
            if (findCls.members[tt].namespace.tags[yy].title == "interface") {
                interfaces.push(findCls.members[tt]);
                found = true;
            }
        }
        if (!found) klasses.push(findCls.members[tt]);
    }
    else {
        klasses.push(findCls.members[tt]);
    }
}


findCls.members = klasses;
if (findInter == -1) {
    this.nav.topLevelNav.push({ title: 'Interfaces', link: 'classes.list.html', members: interfaces})
}
else {
    findInter.members = findInter.members.concat(interfaces);
}

this.nav.topLevelNav.forEach(function (entry) {

    if (entry.members.length != 0)

        if (entry.title !== "Callbacks") {
            entry.members.length
        }
    if (entry.title === "Classes" || entry.title === "Interfaces" || entry.title === "Enums" || entry.title === "Callbacks") {
        // Special class process
        var constructRoutesObject = function (routesArray) {
            var tree = {};
            for (var i in routesArray) {
                var thisRoute = routesArray[i].split('.');
                var innerScope = tree;
                for (var el in thisRoute) {
                    if (!innerScope[thisRoute[el]]) {
                        var equals = {};
                        if (el == thisRoute.length - 1) {
                            equals = routesArray[i];
                        }
                        innerScope[thisRoute[el]] = equals;
                    }
                    innerScope = innerScope[thisRoute[el]];
                }
            }
            return tree;
        };
        var formRoutesTree = function (routesObject) {
            var result = '';
            for (var b in routesObject) {
                result += '<li>';
                if (typeof routesObject[b] == 'string') {

                    var link = "";
                    switch (entry.title) {
                        case "Enums":
                            var dataLink = routesObject[b].substr(0, routesObject[b].lastIndexOf('.'));
                            if (dataLink == "") {
                                link = "global"
                            }
                            else {
                                link = dataLink;
                            }
                            //result += '<a href="' + link + '.html#' + b + '">' + b + '</a>';
                            break;
                        case "Callbacks":
                            link = routesObject[b];
                            var lnk = link.split('#');
                            if (lnk[1]) {
                                //result += '<a href="' + lnk[0] + '.html#'+(lnk[1]||"")+'">' + b.split('#')[0] + '</a>';
                            }
                            else {
                                //result += '<a href="' + lnk[0].split('.html')[0].split(b.split('#')[0])[0] + 'html#' + b.split('#')[0] + '">' + b.split('#')[0] + '</a>';
                            }
                            break;
                        default:
                            link = routesObject[b];
                            //result += '<a href="' + link + '.html">' + b + '</a>';
                            break;
                    }


                } else {
                    result += '<div class="routeTitle">' + b + '</div><ul class="children nav nav-list">';
                    result += formRoutesTree(routesObject[b]);
                    result += '</ul>';
                }
                result += '</li>';
            }
            return result;
        };
        var classesArray = [];
        entry.members.forEach(function (member) {
            if (typeof member != "string") {
                var lnk = "";
                var realName = member.namespace.longname;
                var included = true;
                switch (entry.title) {
                    case "Enums":
                        lnk = member.namespace.longname.substr(0, member.namespace.longname.lastIndexOf('.'));
                        break;
                    case "Callbacks":
                        lnk = member.namespace.longname;
                        if (lnk.indexOf('#') != -1) {
                            included = false;
                        }
                        else {
                            lnk = member.namespace.longname.substr(0, member.namespace.longname.lastIndexOf('.'))
                        }
                        break;
                    default:
                        lnk = member.namespace.longname;
                        break;
                }
                if (included) {
                    that.searchMembers.push(
                        {
                            realName: realName,
                            link: lnk
                        });
                    classesArray.push(member.namespace.longname);
                }

            }
        });
        var classTree = constructRoutesObject(classesArray);
        var htmlClassStructure = formRoutesTree(classTree);

    } else {

        // Regular process

        entry.members.forEach(function (member) {
            if (typeof member != "string") that.searchMembers.push({ realName: member.namespace.longname, link: ( entry.title === "Enums" ? member.namespace.longname.substr(0, member.namespace.longname.lastIndexOf('.')) : member.namespace.longname )});
            if (typeof member != "string") {
                member.link
            } else {
                egret_log("1111111")
                egret_log(member);
            }
        });
    }

});

if (docs && docs[0].kind !== "source") {
} else {
}
egret_log(content)

if (that.navOptions.footer.length > 0) {
}
if (that.navOptions.copyright.length > 0) {
}
if (docs && docs[0].kind !== "source") {
}

