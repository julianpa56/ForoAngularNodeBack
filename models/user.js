'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    name :      String,
    surname :   String,
    email :     String,
    password :  String,
    image :     String,
    role :      String
});

/*
ELIMINACION DE PARAMETROS DEL OBJETO DEVUELTO POPULADO O ADJUNTADO

De esta manera podemos eliminar cualquier parametro sensible y no necesario
*/

UserSchema.methods.toJSON = function(){
    var obj = this.toObject()
    delete obj.password
    return obj
}

module.exports = mongoose.model('User', UserSchema);
