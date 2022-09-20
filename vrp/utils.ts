import * as fs from 'fs';

export function getFirst(str:string) {
    if(!str) return str;
    str = str.indexOf(':') >= 0 ? str.split(':')[0] : str;
    str = str[str.length - 1] === '/' ? str.substring(0, str.length - 1) : str;
    return str;
}

export function strToVar(ast:object, str:string) {
    if(!str) return str;
    return (new Function('ast', `return ${str}`))(ast);
}

export function writeFile(path:string, template:string) {
    if(!fs.existsSync(path)) {
        fs.writeFile(path, template, (err) => {
            if(!err) {
                console.log(`created a file: ${path}`)
            }
        });
    }
}