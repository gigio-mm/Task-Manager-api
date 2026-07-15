import http from "node:http"

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if(method === 'GET' & url === '/users') {
        return res.end('Hello World!');
    }

    return res.writeHead(404).end();
})

server.listen(3333, () => {
    console.log("Server running on http://localhost:3333")
})