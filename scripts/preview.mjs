// Local singleplayer preview only. Multiplayer signaling remains server.mjs's job.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.png':'image/png'};
const port=Number(process.env.PORT)||8080;
createServer(async(req,res)=>{
    try{
        let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
        if(path!==root&&!path.startsWith(root+sep))throw new Error('Outside preview root');
        if(path===root)path=resolve(root,'index.html');
        const body=await readFile(path);res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(body);
    }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Singleplayer preview: http://127.0.0.1:${port}`));
