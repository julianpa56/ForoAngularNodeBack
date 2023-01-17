'use strict'

var validator = require('validator');
var User = require('./../models/user')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('./../services/jwt')
var fs = require('fs')
var path = require('path')

var userController = {
    probando: function (req, res) {
        return res.status(200).send({
            message: "Soy el metodo probando"
        })
    },

    testeando: function (req, res) {
        return res.status(200).send({
            message: "Soy el metodo testeando"
        })
    },

    save: function (req,res) {
        // Recoger los parametros de la peticion
        var params = req.body;

        // Validar los datos 
        try{
            var validate_name = !validator.isEmpty(params.name) 
            var validate_surname = !validator.isEmpty(params.surname) 
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email)  
            var validate_password = !validator.isEmpty(params.password)
        }
        catch(err){
            return res.status(400).send({
                message : 'Datos enviados incorrectamente'
            })
        }
        // console.log("--",validate_name,validate_surname,validate_email,validate_password)

        if (validate_name && validate_surname && validate_email && validate_password) {

            // Crear el objeto 

            var newUser = new User()
            
            // Asignar valores al usuario

            newUser.name = params.name
            newUser.surname = params.surname
            newUser.email = params.email.toLowerCase()
            newUser.role = 'ROLE_USER'
            newUser.image = null
    
            // Comprobar si el usuario existe

            User.findOne({email : newUser.email}, (err, issetUser) => {
                if(err){
                    return res.status(500).send({
                        message : 'Error al comprobar duplicidad de usuario'
                    })
                }

                if(!issetUser){
                    // Si no existe ciframos la contraseña
                    
                    bcrypt.hash(params.password, null, null, (err,hash)=> {
                        newUser.password = hash

                        // Guardar el nuevo usuario 

                        newUser.save((err, userStored) => {
                            if(err){
                                return res.status(500).send({
                                    status : 'error',
                                    message : 'Error al guardar usuario'
                                })
                            }
                            if(!userStored) {
                                return res.status(400).send({
                                    status : 'error',
                                    message : 'El usuario no se ha guardado'
                                })
                            }

                            // Devolvemos respuesta positiva
                            return res.status(200).send({
                                status : 'success',
                                user : userStored
                            })
                        })
                
                    })

                }
                else {
                    return res.status(500).send({
                        status : 'error',
                        message : 'El usuario ya existe'
                    })
                }
            })
    
        }
        else {
            return res.status(404).send({
                status : 'error',
                message : 'Validacion de datos incorrecta'
            })
        }
    },

    login: function (req,res) {
        // Recoger los datos de la peticion
        var params = req.body
        // Validar los datos 
        console.log(params)
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email)
            var validate_password = validator.isEmpty(params.password)
        }
        catch(err){
            return res.status(400).send({
                status : 'error',
                message : 'Datos enviados incorrectamente 1'
            })
        }

        if (!validate_email || validate_password) {
            return res.status(400).send({
                status : 'error',
                message : 'Datos enviados incorrectamente 2'
            })
        }
        else {
            // Buscar el usuario que coincida con el mail
            User.findOne({email : params.email.toLowerCase()}, (err, issetUser) => {

                if (err) {
                    return res.status(500).send({
                        status : 'error',
                        message : 'Error al intentar identificarse'
                    })
                }

                if (!issetUser) {
                    return res.status(404).send({
                        status : 'error',
                        message : 'El usuario no existe'
                    })
                }

                // Si lo encuentra comprobar la contraseña

                bcrypt.compare(params.password,issetUser.password, (err, check) => {

                    if (check) {
                        // Generar token de jwt y devolverlo luego
                        if (params.gettoken) {
                                // Devolver token
                            return res.status(200).send({
                                token : jwt.createToken(issetUser)
                            })
                        }
                        else {
                            // Limpiamos el objeto a devolver 
    
                            issetUser.password = undefined
    
                            // Devolver respuesta positiva 
                            return res.status(200).send({
                                status : 'success',
                                user : issetUser
                            })
                        }


                    }
                    else {
                        return res.status(200).send({
                            status : 'success',
                            message : 'Las credenciales no son correctas'
                        })
                    }
                })
            })
        

        }

    },

    update: function(req,res) {
        // Recoger los datos de la peticion
        var params = req.body

        try {
            // Validar los datos 
            
            var validate_name = !validator.isEmpty(params.name)
            var validate_surname = !validator.isEmpty(params.surname)
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email)
    
            if(!validate_name || !validate_surname || !validate_email){
                return res.status(400).send({
                    status : 'error',
                    message : 'Los datos enviados son erroneos'
                })
            }
            // Eliminar propiedades innecesarias
            delete params.password

            // Buscar y actualizar documento
            var userId = req.user.sub

            // Comprobar email duplicado

            if(req.user.email != params.email){
                User.findOne({ email : params.email.toLowerCase()}, (error, issetUser) => {
                    if(error){
                        return res.status(500).send({
                            status : 'error',
                            message : 'Error al identificarse',
                        })
                    }
                    // Si existe otro usuario con ese email
                    if(issetUser && issetUser.email == params.email){
                        return res.status(200).send({
                            status : 'error',
                            message : 'El mail no puede ser modificado',
                        })
                    }
                    if(!issetUser) {
                            //  ---- findOneAndUpdate -> condicion , datos a actualizar, opciones, funcion callback
                        User.findOneAndUpdate({_id : userId},params,{new:true},(error, userUpdated) => {
                            if(error) {
                                return res.status(400).send({
                                    status : 'error',
                                    message : 'Error al actualizar usuario',
                                })
                            }
        
                            if(!userUpdated) {
                                return res.status(400).send({
                                    status : 'error',
                                    message : 'Usuario no encontrado',
                                })
                            }
                            
                            return res.status(200).send({
                                status : 'success',
                                message : 'Usuario actualizado correctamente',
                                user : userUpdated
                            })
                            
                        })   
                    }
                })
            }
            else {
                    //  ---- findOneAndUpdate -> condicion , datos a actualizar, opciones, funcion callback
                User.findOneAndUpdate({_id : userId},params,{new:true},(error, userUpdated) => {
                    if(error) {
                        return res.status(400).send({
                            status : 'error',
                            message : 'Error al actualizar usuario',
                        })
                    }

                    if(!userUpdated) {
                        return res.status(400).send({
                            status : 'error',
                            message : 'Usuario no encontrado',
                        })
                    }
                    
                    return res.status(200).send({
                        status : 'success',
                        message : 'Usuario actualizado correctamente',
                        user : userUpdated
                    })
                    
                })    
            }
            
        }
        catch(err){
            return res.status(400).send({
                status : 'error',
                message : 'Faltan datos por enviar'
            })
        }
    },

    uploadAvatar: function(req,res){
        // Configurar el modulo multiparty  - YA ESTA EN EL ARCHIVO userRoutes.js

        // Recoger el fichero de la peticion
        var file_name = 'Avatar no subido...';

        if(!req.files){
            return res.status(400).send({
                status : 'error',
                message : file_name
            })
        }

        // Conseguir el nombre y la extension del archivo subido

        var file_path = req.files.file0.path
        var file_split = file_path.split('\\')

        var file_name = file_split[2]
        var ext_split = file_name.split('.')
        var file_ext = ext_split[1]

        // Comprobar extension (solo imagenes), si no es valida borrar fichero subido

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status : 'error',
                    message : 'La extension del archivo no es valida'
                })
            })
        }
        else {
            // Sacar el id del usuario identificado

            var userId = req.user.sub

            // Buscar y actualizar el documento de la db

            User.findOneAndUpdate({ _id : userId }, { image : file_name }, { new : true }, (error,userUpdated) => {
                if(error || !userUpdated){
                    return res.status(500).send({
                        status : 'error',
                        message : 'Error al subir la imagen'
                    })
                }
                else {
                    // Devolver respuesta
                    return res.status(200).send({
                        status : 'success',
                        message : 'Avatar actualizado correctamente',
                        user : userUpdated
                    })
                }
            })
        }
        
    },

    avatar : function (req,res) {
        var file_name = req.params.fileName
        var path_file = './uploads/users/'+file_name

        fs.exists(path_file, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(path_file))
            }
            else {
                return res.status(404).send({
                    status : 'error',
                    message : 'La imagen no existe'
                })
            }
        })
    },

    getUsers : function (req,res) {
        User.find().exec((error,users) => {
            if(error || !users) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No hay usuarios que mostrar'
                })
            }
            return res.status(200).send({
                status : 'success',
                users
            })
        })
    },

    getUser : function (req,res) {
        var userId = req.params.userId

        User.findById(userId).exec((error,user) => {
            if(error || !user) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No existe el usuario'
                })
            }
            return res.status(200).send({
                status : 'success',
                user
            })
        })
    }
};

module.exports = userController;