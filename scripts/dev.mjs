import { spawn } from 'node:child_process'
const child=spawn(process.execPath,['node_modules/vite/bin/vite.js',...process.argv.slice(2)],{stdio:'inherit'})
child.on('error',error=>{console.error(error.message);process.exitCode=1})
child.on('exit',code=>{process.exitCode=code||0})
process.on('SIGINT',()=>child.kill('SIGINT'))
process.on('SIGTERM',()=>child.kill('SIGTERM'))
