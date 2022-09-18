import { resolve } from 'path'
import * as babelParser from '@babel/parser'
import generate from '@babel/generator';
import * as fs from 'fs'

const ROOT = 'D:/MY/fcp';
const filePath = 'D:/MY/fcp/src/views';

let rp = '/about/test';
let target = ['user', 'info'];

const raw = fs.readFileSync(`${ROOT}/src/router/index.ts`, 'utf-8')
const ast = babelParser.parse(raw, {sourceType: 'module'});

function matchPath(node:any, target:any, level:number, path:string) {
    if(!node) {
        return {
            level,
            path
        }
    };
    if(node.type === 'ArrayExpression') {
        let isMatch = false;
        let index = undefined;
        let childrenIndex = undefined;
        node.elements.forEach((n, i) => {
            let flag = false;
            n.properties.forEach((item, itemIndex) => {
                let regexp = new RegExp(`^/?${target[level]}:?.*$`);
                if(item.key.name === 'path' && regexp.test(item.value.value)) {
                    isMatch = true;
                    flag = true;
                    index = i;
                }
                if(flag && item.key.name === 'children') {
                    childrenIndex = itemIndex;
                }
            })
        })
        if(isMatch) {
            path += `${level > 0 ? `['value']` : ''}['elements'][${index}]['properties']${typeof childrenIndex === 'number' ? `[${childrenIndex}]` : ''}`;
        } else if(level === 0) {
            path += "['elements']";
        }
        if(isMatch && typeof index === 'number') {
            let n = typeof childrenIndex === 'number' ? node.elements[index].properties[childrenIndex].value : null;
            return matchPath(n, target, level + 1, path);
        }
    }
    return {
        level,
        path
    };
}

// let target = ['about', 'profile', 'p4', 'sss', 'sjsjsh'];
function writeRouterAst(target:Array<any>, path:string, level:number, componentPath:string) {
    if(level+1 > target.length) return;
    componentPath += `/${target[level]}`;
    let component = componentPath + '.vue';
    eval(`
        let len = ${path}.length;
        if(len) {
            let hasChild = false;
            ${path} && ${path}.forEach(item => {
                if(item.key && item.key.name === 'children') {
                    hasChild = true;
                }
            })
            if(!hasChild && level != 0) {
                ${path}.push({
                    type: 'ObjectProperty',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {
                        type: 'Identifier',
                        name: 'children',
                    },
                    value: {
                        type: 'ArrayExpression',
                        elements: []
                    }
                })
                path = path + '[' + len + ']'
            }
        }
    `);
    let len = eval(`level > 0 ? ${path}.value.elements.length : ${path}.length`);
    let code = `
        let node = level > 0 ? ${path}.value.elements : ${path};
        node.push({
            type: 'ObjectExpression',
            properties: [
                {
                    type: 'ObjectProperty',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {
                        type: 'Identifier',
                        name: 'path'
                    },
                    value: {
                        type: 'StringLiteral',
                        extra: {
                            rawValue: '${level > 0 ? target[level] :  '/' + target[level]}',
                            raw: "'${level > 0 ? target[level] : '/' + target[level]}'"
                        },
                        value: '${level > 0 ? target[level] :  '/' + target[level]}',
                    },
                    kind: 'init',
                },
                {
                    type: 'ObjectProperty',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {
                        type: 'Identifier',
                        name: 'name'
                    },
                    value: {
                        type: 'StringLiteral',
                        extra: {
                            rawValue: '${target[level]}',
                            raw: "'${target[level]}'"
                        },
                        value: '${target[level]}',
                    },
                    kind: 'init',
                },
                {
                    type: 'ObjectProperty',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {
                        type: 'Identifier',
                        name: 'component',
                    },
                    value: {
                        type: 'ArrowFunctionExpression',
                        id: null,
                        generator: false,
                        async: false,
                        params: [],
                        body: {
                            type: 'CallExpression',
                            callee: {
                                type: 'Import',
                            },
                            arguments: [
                                {
                                    type: 'StringLiteral',
                                    extra: {
                                        rawValue: component,
                                        raw: "'${component}'"
                                    },
                                    value: component
                                }
                            ]
                        }
                    }
                },
                ${level+1 < target.length ? `
                {
                    type: 'ObjectProperty',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: {
                        type: 'Identifier',
                        name: 'children',
                    },
                    value: {
                        type: 'ArrayExpression',
                        elements: []
                    }
                }
                ` : ''}
            ]
        })
    `
    eval(code);
    path += level > 0 ? `['value']['elements'][${len}]['properties'][3]` : `[${len}]['properties'][3]`;
    writeRouterAst(target, path, level + 1, componentPath);
}

// let target = ['about3', 'profile', 'p3', 'sss', 'sddddss3'];
function createFile(target:Array<any>) {
    let path = filePath;
    target.forEach((item, index) => {
        if(index < target.length - 1) {
            // create folder
            path += `/${item}`;
            if(!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            if(!fs.existsSync(`${path}.vue`)) {
                fs.writeFile(`${path}.vue`, '1122', (err) => {
                    if(!err) {
                        console.log(`create a file: ${path}.vue`)
                    }
                });
            }
        } else {
            // create a file
            path += `/${item}.vue`;
            if(!fs.existsSync(path)) {
                fs.writeFile(path, '1122', (err) => {
                    if(!err) {
                        console.log(`create a file: ${path}`)
                    }
                });
            }
        }
        console.log(item, 'item')
        console.log(index, 'index')
    })
}


// console.log(ast['program']['body'][2]['declarations'][0]['init'], 'ss')
ast.program.body.forEach((node, index) => {
    if(node.type === 'VariableDeclaration' && 
       node.declarations[0] && 
       node.declarations[0].type === 'VariableDeclarator' &&
       node.declarations[0].id['name'] === 'routes') {
        let path = `ast['program']['body'][${index}]['declarations'][0]['init']`
        let matchRes = matchPath(node.declarations[0].init, target, 0, path);
        console.log(matchRes, 'matchRes');
        writeRouterAst(target, matchRes.path, matchRes.level, '../views');
        createFile(target)
        // console.log(eval(matchRes.path+'.value.elements[0].properties'), 'vmatchRes.pathmatchRes.path')
        const { code } = generate(ast);
        fs.writeFileSync(`${ROOT}/src/router/index.ts`, code);
        // let res = eval(matchRes.path);
        // console.log(res, 'ress')
    }
})
