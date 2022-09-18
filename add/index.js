"use strict";
exports.__esModule = true;
var babelParser = require("@babel/parser");
var generator_1 = require("@babel/generator");
var fs = require("fs");
var ROOT = 'D:/MY/fcp';
var filePath = 'D:/MY/fcp/src/views';
var rp = '/about/test';
var target = ['user', 'info'];
var raw = fs.readFileSync("".concat(ROOT, "/src/router/index.ts"), 'utf-8');
var ast = babelParser.parse(raw, { sourceType: 'module' });
function matchPath(node, target, level, path) {
    if (!node) {
        return {
            level: level,
            path: path
        };
    }
    ;
    if (node.type === 'ArrayExpression') {
        var isMatch_1 = false;
        var index_1 = undefined;
        var childrenIndex_1 = undefined;
        node.elements.forEach(function (n, i) {
            var flag = false;
            n.properties.forEach(function (item, itemIndex) {
                var regexp = new RegExp("^/?".concat(target[level], ":?.*$"));
                if (item.key.name === 'path' && regexp.test(item.value.value)) {
                    isMatch_1 = true;
                    flag = true;
                    index_1 = i;
                }
                if (flag && item.key.name === 'children') {
                    childrenIndex_1 = itemIndex;
                }
            });
        });
        if (isMatch_1) {
            path += "".concat(level > 0 ? "['value']" : '', "['elements'][").concat(index_1, "]['properties']").concat(typeof childrenIndex_1 === 'number' ? "[".concat(childrenIndex_1, "]") : '');
        }
        else if (level === 0) {
            path += "['elements']";
        }
        if (isMatch_1 && typeof index_1 === 'number') {
            var n = typeof childrenIndex_1 === 'number' ? node.elements[index_1].properties[childrenIndex_1].value : null;
            return matchPath(n, target, level + 1, path);
        }
    }
    return {
        level: level,
        path: path
    };
}
// let target = ['about', 'profile', 'p4', 'sss', 'sjsjsh'];
function writeRouterAst(target, path, level, componentPath) {
    if (level + 1 > target.length)
        return;
    componentPath += "/".concat(target[level]);
    var component = componentPath + '.vue';
    eval("\n        let len = ".concat(path, ".length;\n        if(len) {\n            let hasChild = false;\n            ").concat(path, " && ").concat(path, ".forEach(item => {\n                if(item.key && item.key.name === 'children') {\n                    hasChild = true;\n                }\n            })\n            if(!hasChild && level != 0) {\n                ").concat(path, ".push({\n                    type: 'ObjectProperty',\n                    method: false,\n                    shorthand: false,\n                    computed: false,\n                    key: {\n                        type: 'Identifier',\n                        name: 'children',\n                    },\n                    value: {\n                        type: 'ArrayExpression',\n                        elements: []\n                    }\n                })\n                path = path + '[' + len + ']'\n            }\n        }\n    "));
    var len = eval("level > 0 ? ".concat(path, ".value.elements.length : ").concat(path, ".length"));
    var code = "\n        let node = level > 0 ? ".concat(path, ".value.elements : ").concat(path, ";\n        node.push({\n            type: 'ObjectExpression',\n            properties: [\n                {\n                    type: 'ObjectProperty',\n                    method: false,\n                    shorthand: false,\n                    computed: false,\n                    key: {\n                        type: 'Identifier',\n                        name: 'path'\n                    },\n                    value: {\n                        type: 'StringLiteral',\n                        extra: {\n                            rawValue: '").concat(level > 0 ? target[level] : '/' + target[level], "',\n                            raw: \"'").concat(level > 0 ? target[level] : '/' + target[level], "'\"\n                        },\n                        value: '").concat(level > 0 ? target[level] : '/' + target[level], "',\n                    },\n                    kind: 'init',\n                },\n                {\n                    type: 'ObjectProperty',\n                    method: false,\n                    shorthand: false,\n                    computed: false,\n                    key: {\n                        type: 'Identifier',\n                        name: 'name'\n                    },\n                    value: {\n                        type: 'StringLiteral',\n                        extra: {\n                            rawValue: '").concat(target[level], "',\n                            raw: \"'").concat(target[level], "'\"\n                        },\n                        value: '").concat(target[level], "',\n                    },\n                    kind: 'init',\n                },\n                {\n                    type: 'ObjectProperty',\n                    method: false,\n                    shorthand: false,\n                    computed: false,\n                    key: {\n                        type: 'Identifier',\n                        name: 'component',\n                    },\n                    value: {\n                        type: 'ArrowFunctionExpression',\n                        id: null,\n                        generator: false,\n                        async: false,\n                        params: [],\n                        body: {\n                            type: 'CallExpression',\n                            callee: {\n                                type: 'Import',\n                            },\n                            arguments: [\n                                {\n                                    type: 'StringLiteral',\n                                    extra: {\n                                        rawValue: component,\n                                        raw: \"'").concat(component, "'\"\n                                    },\n                                    value: component\n                                }\n                            ]\n                        }\n                    }\n                },\n                ").concat(level + 1 < target.length ? "\n                {\n                    type: 'ObjectProperty',\n                    method: false,\n                    shorthand: false,\n                    computed: false,\n                    key: {\n                        type: 'Identifier',\n                        name: 'children',\n                    },\n                    value: {\n                        type: 'ArrayExpression',\n                        elements: []\n                    }\n                }\n                " : '', "\n            ]\n        })\n    ");
    eval(code);
    path += level > 0 ? "['value']['elements'][".concat(len, "]['properties'][3]") : "[".concat(len, "]['properties'][3]");
    writeRouterAst(target, path, level + 1, componentPath);
}
// let target = ['about3', 'profile', 'p3', 'sss', 'sddddss3'];
function createFile(target) {
    var path = filePath;
    target.forEach(function (item, index) {
        if (index < target.length - 1) {
            // create folder
            path += "/".concat(item);
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            if (!fs.existsSync("".concat(path, ".vue"))) {
                fs.writeFile("".concat(path, ".vue"), '1122', function (err) {
                    if (!err) {
                        console.log("create a file: ".concat(path, ".vue"));
                    }
                });
            }
        }
        else {
            // create a file
            path += "/".concat(item, ".vue");
            if (!fs.existsSync(path)) {
                fs.writeFile(path, '1122', function (err) {
                    if (!err) {
                        console.log("create a file: ".concat(path));
                    }
                });
            }
        }
        console.log(item, 'item');
        console.log(index, 'index');
    });
}
// console.log(ast['program']['body'][2]['declarations'][0]['init'], 'ss')
ast.program.body.forEach(function (node, index) {
    if (node.type === 'VariableDeclaration' &&
        node.declarations[0] &&
        node.declarations[0].type === 'VariableDeclarator' &&
        node.declarations[0].id['name'] === 'routes') {
        var path = "ast['program']['body'][".concat(index, "]['declarations'][0]['init']");
        var matchRes = matchPath(node.declarations[0].init, target, 0, path);
        console.log(matchRes, 'matchRes');
        writeRouterAst(target, matchRes.path, matchRes.level, '../views');
        createFile(target);
        // console.log(eval(matchRes.path+'.value.elements[0].properties'), 'vmatchRes.pathmatchRes.path')
        var code = (0, generator_1["default"])(ast).code;
        fs.writeFileSync("".concat(ROOT, "/src/router/index.ts"), code);
        // let res = eval(matchRes.path);
        // console.log(res, 'ress')
    }
});
