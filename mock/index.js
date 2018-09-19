const jsonServer = require('json-server')
const express = require('express')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use('/api', router)
server.use(express.static('public'))
server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

server.listen(3000, () => console.log('Mock is running'))