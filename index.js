const http = require('http');
const server = http.createServer((req, res) => {
res.setHeader('Content-Type', 'text/plain');
res.write('Hello World\n');

if (req.url === '/' && req.method === 'GET') {
        res.end(JSON.stringify({ message: 'welcome to homepage' }));
    }
    else if (req.url === '/api/users' && req.method === 'GET') {
        const users = [
            { id: 1, name: 'ali', age: 25 },
            { id: 2, name: 'sara', age: 30 }
        ];
        res.end(JSON.stringify(users));
    }
    else if (req.url === '/api/products' && req.method === 'GET') {
        const products = [
            { lab: 'lab1', price: 1000 },
            { pc: 'pc1', price: 2000 }
        ];
        res.end(JSON.stringify(products));
    }


    else if (req.url === '/api/users' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });


        req.on('end', () => {
            const parsedData = body ? JSON.parse(body) : {};
            
            res.statusCode = 201;
            res.end(JSON.stringify({
                message: 'Data received and saved successfully',
                data: parsedData
            }));
        });
    }
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'page not found' }));
    }




});
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
