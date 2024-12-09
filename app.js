const PORT = 3000;
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const createHelperPath = (page) => path.resolve(__dirname, 'Helper', `${page}.js`);
const router = require(createHelperPath('routs'))
const Application = require(createHelperPath('Aplication'));
const createPath = (page) => path.resolve(__dirname,'Helper', 'pub', `${page}.ejs`);

function ErrFunc(e) {
    if (e) {
        console.log(e);
    }
}

function Render(req, res, page, data = {}) {
    const filePath = createPath(page); 
    ejs.renderFile(filePath, data, (error, str) => {
        if (error) {
            console.error(`Ошибка рендеринга файла: ${filePath}`, error);
            res.statusCode = 500;
            res.end('Ошибка сервера');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(str); 
        }
    });
}

const app = new Application(Render); 



app.addRouter(router);


app.listen(PORT, (e) => {
    ErrFunc(e);
    console.log(`Сервер запущен на порту: ${PORT}`);
});