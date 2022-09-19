import { join } from 'path'
import * as babelParser from '@babel/parser'
import generate from '@babel/generator';
import * as fs from 'fs'
import { findUp, findUpSync } from 'find-up'
import { matchPath, writeRouterAst, createFile} from './fs';

export async function run() {
    const result = findUpSync('vrp.config.json');
    if(!result) {
        console.log(`Cannot find 'vrp.config.json'`);
        return false;
    }

    const ROOT = await findUp(async (root) => {
        return root
    }, {type: 'directory'});

    const config = JSON.parse(fs.readFileSync(result, 'utf8'));
    

    const routerPath = join(ROOT, config.routerPath);
    const pageDir = join(ROOT, config.pageDir);
    const componentPrefix = config.componentPrefix;


    const args:Array<any> = process.argv.slice(2);
    const target = args[0] && args[0].split(/\/(?!\:)/).filter((item:string) => item);

    const raw = fs.readFileSync(routerPath, 'utf-8')
    const ast = babelParser.parse(raw, {sourceType: 'module'});
    ast.program.body.forEach((node, index) => {
        if(node.type === 'VariableDeclaration' && 
           node.declarations[0] && 
           node.declarations[0].type === 'VariableDeclarator' &&
           node.declarations[0].id['name'] === 'routes') {
            let path = `ast['program']['body'][${index}]['declarations'][0]['init']`
            let matchRes = matchPath(node.declarations[0].init, target, 0, path);
            const newAst = writeRouterAst(ast, target, matchRes.path, matchRes.level, componentPrefix);
            createFile(target, pageDir);
            const { code } = generate(newAst);
            fs.writeFileSync(routerPath, code);
        }
    })
}