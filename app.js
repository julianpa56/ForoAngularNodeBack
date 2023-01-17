'use strict'

// Requires 

var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar extress 

var app = express();

// Cargar archivos de rutas

var user_routes = require('./routes/userRoutes')
var topic_routes = require('./routes/topicRoutes')
var comment_routes = require('./routes/commentRoutes')

// Middlewares

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// CORS 

    // Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Reescribir rutas 

app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);

//  Rutas de prueba

app.get('/prueba', (req, res) => {
    return res.status(200).send('<h1>Hola mundo desde el backend </h1>');
    // return res.status(200).send({
    //     message : "Hola mundo desde el backend con node",
    //     nombre : "Julian Peña"
    // });
})

app.post('/prueba', (req, res) => {
    return res.status(200).send({
        message : "Hola mundo desde el backend con node",
        nombre : "Julian Peña"
    });
})

// Exportar el modulo 

module.exports = app;