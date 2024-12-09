const http = require('http');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

module.exports = class Application {
    constructor(renderFunction) {
        this.emitter = new EventEmitter();
        this.server = this._createServer();
        this.render = renderFunction; 
    }

    addRouter(router) {
        Object.keys(router.endpoints).forEach((path) => {
            const endpoint = router.endpoints[path];
            Object.keys(endpoint).forEach((method) => {
                const handler = endpoint[method];
                this.emitter.on(this._getRouterMask(path, method), (req, res) => {
                    handler(req, res);
                });
            });
        });
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }

    _serveStatic(req, res) {
        const filePath = path.join(__dirname, 'pub', req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.end('Static file not found');
                return;
            }
            const ext = path.extname(filePath);
            const mimeTypes = {
                '.css': 'text/css',
                '.js': 'text/javascript',
                '.html': 'text/html',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.end(data);
        });
    }

    _createServer() {
        return http.createServer((req, res) => {
            const [path] = req.url.split('?'); 
            if (req.url.startsWith('/styles/') || req.url.endsWith('.css')) {
                this._serveStatic(req, res); 
                return; 
            }
            let matchedRoute = null;
            let params = {};
            
    
            for (const route of this.emitter.eventNames()) {
                const [routePath, routeMethod] = route.slice(1, -1).split(']:[');
                if (routeMethod === req.method) {
                    const routeSegments = routePath.split('/');
                    const pathSegments = path.split('/');
    
                    if (routeSegments.length === pathSegments.length) {
                        let isMatch = true;
                        const tempParams = {};
    
                        for (let i = 0; i < routeSegments.length; i++) {
                            if (routeSegments[i].startsWith(':')) {
                                const paramName = routeSegments[i].slice(1);
                                tempParams[paramName] = pathSegments[i];
                            } else if (routeSegments[i] !== pathSegments[i]) {
                                isMatch = false;
                                break;
                            }
                        }
    
                        if (isMatch) {
                            matchedRoute = route;
                            params = tempParams;
                            break;
                        }
                    }
                }
            }
    
            if (matchedRoute) {
                req.params = params; 
                this.emitter.emit(matchedRoute, req, res);
            } else {
                res.statusCode = 404;
                this.render(req, res, 'error'); 
            }
        });
    }

    _getRouterMask(path, method) {
        return `[${path}]:[${method}]`;
    }
};