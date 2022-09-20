import * as fs from 'fs';
import { join } from 'path';
import { getFirst, strToVar } from './utils';

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
    let p = strToVar(ast, path);
    let l:any = p.length;
    if(l) {
        let hasChild = false;
        p && p.forEach(item => {
            if(item.key && item.key.name === 'children') {
                hasChild = true;
            }
        })
        if(!hasChild && level != 0) {
            p.push({
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
            path = path + '[' + l + ']'
        }
    }
    let len = level > 0 ? p.value.elements.length : p.length;
    let node = level > 0 ? p.value.elements : p;
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
                        rawValue: level > 0 ? target[level] :  '/' + target[level],
                        raw: level > 0 ? `'${target[level]}'` : `'/${target[level]}'`
                    },
                    value: level > 0 ? target[level] :  '/' + target[level],
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
                        rawValue: name,
                        raw: `'${name}'`
                    },
                    value: name,
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
                                    raw: `'${component}'`
                                },
                                value: component
                            }
                        ]
                    }
                }
            },
            level+1 < target.length ? 
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
            : ''
        ]
    })
    path += level > 0 ? `['value']['elements'][${len}]['properties'][3]` : `[${len}]['properties'][3]`;
    return writeRouterAst(ast, target, path, level + 1, componentPath);
}

export function createFile(target:Array<any>, pageDir:string) {
    let path = pageDir;
    const ROOT = process.cwd();
    const templatePath = join(ROOT, 'vrp.template.vue');
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
    if(fs.existsSync(templatePath)) {
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
                ((path) => {
                    fs.writeFile(`${path}.vue`, template, (err) => {
                        if(!err) {
                            console.log(`created a file: ${path}.vue`)
                        }
                    });
                })(path)
            }
        } else {
            // create a file
            path += `/${item}.vue`;
            if(!fs.existsSync(path)) {
                ((path) => {
                    fs.writeFile(path, template, (err) => {
                        if(!err) {
                            console.log(`created a file: ${path}`)
                        }
                    });
                })(path)
            }
        }
    })
}
