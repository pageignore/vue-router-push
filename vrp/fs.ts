import * as fs from 'fs'
import { findUpSync } from 'find-up'

export function matchPath(node:any, target:any, level:number, path:string) {
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

export function writeRouterAst(ast:object,target:Array<any>, path:string, level:number, componentPath:string) {
    if(level+1 > target.length) return ast;
    let component = componentPath;
    target.forEach((item, index) => {
        item = getFirst(item);
        if(index <= level) {
            component += `/${item}`;
        }
    })
    component = component + '.vue';
    let name = getFirst(target[level]);
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
                            rawValue: '${name}',
                            raw: "'${name}'"
                        },
                        value: '${name}',
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
    return writeRouterAst(ast, target, path, level + 1, componentPath);
}

export function createFile(target:Array<any>, pageDir:string) {
    let path = pageDir;
    const templatePath = findUpSync('vrp.template.vue');
    let template = `<script setup>
import { reactive, ref } from 'vue';
</script>
<template>
    <div class="">
        <router-view></router-view>
    </div>
</template>
<style>
    
</style>`;
    if(templatePath) {
        template = fs.readFileSync(templatePath, 'utf-8');
    }
    target.forEach((item, index) => {
        item = getFirst(item);
        if(index < target.length - 1) {
            // create folder
            path += `/${item}`;
            if(!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            if(!fs.existsSync(`${path}.vue`)) {
                fs.writeFile(`${path}.vue`, template, (err) => {
                    if(!err) {
                        console.log(`create a file: ${path}.vue`)
                    }
                });
            }
        } else {
            // create a file
            path += `/${item}.vue`;
            if(!fs.existsSync(path)) {
                fs.writeFile(path, template, (err) => {
                    if(!err) {
                        console.log(`create a file: ${path}`)
                    }
                });
            }
        }
    })
}

function getFirst(str:string) {
    if(!str) return str;
    str = str.indexOf(':') >= 0 ? str.split(':')[0] : str;
    str = str[str.length - 1] === '/' ? str.substring(0, str.length - 1) : str;
    return str;
}