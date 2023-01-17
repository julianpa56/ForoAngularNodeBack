'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", false);

mongoose.connect('mongodb://127.0.0.1/api_rest_node', { useNewUrlParser: true })
        .then(() => {
            console.log('La conexión a MongoDB se realizó correctamente');

            // Crear servidor 

            app.listen(port,() => {
                console.log("El servidor http://localhost:3999 esta funcionando correctamente");
            })
        })
        .catch(error => {
            console.log(error)
        });