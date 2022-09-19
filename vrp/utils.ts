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