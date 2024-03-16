import cluster from 'cluster';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirName= dirname(fileURLToPath(import.meta.url));
const numberOfOs= os.cpus().length;

cluster.setupPrimary({
    exec: __dirName+ "/index.js"
})

for(let osNumber=0; osNumber<numberOfOs;osNumber++)
{
    cluster.fork()
}

cluster.on('exit',()=>{
    cluster.fork();
})
