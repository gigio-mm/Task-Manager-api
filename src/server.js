import http from "node:http";
import { json } from './middlewares/json.js';
import { Database } from "./database.js";

const database = new Database();

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    await json(req, res);

    if(method === 'GET' & url === '/') {
        return res.end(JSON.stringify({message: 'API de tasks rodando com JSON'}));
    }

    return res.writeHead(404).end();
})

server.listen(3333, () => {
    console.log("Server running on http://localhost:3333")
})