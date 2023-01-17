'use strict' 

var validator = require('validator')
var Topic = require('../models/topic')



var topicController = {

    test : function (req,res) {
        return res.status(200).send({
            message : 'Todo ok'
        })
    },

    save : function (req,res) {
        // Recoger los parametros
        
        var params = req.body 
        
        // Validar los datos

        try {
            var validate_title = !validator.isEmpty(params.title)
            var validate_content = !validator.isEmpty(params.content)
            var validate_lang = !validator.isEmpty(params.lang)

        }
        catch(error) {
            return res.status(200).send({
                message : 'Faltan datos por enviar'
            })
        }

        if(validate_content && validate_title && validate_lang) {

            // Crear objeto a guardar
            var topic = new Topic()
            
            // Asignar valores 
            topic.title = params.title
            topic.content = params.content
            topic.lang = params.lang
            topic.code = params.code
            console.log(req.user)
            topic.user = req.user.sub
            // Guardar el topic
            topic.save((error,topicStore) => {

                if(error || !topicStore) {
                    return res.status(404).send({
                        status : 'error',
                        message : 'El tema no se ha guardado'
                    })
                }

                // Devolver respuesta
                return res.status(200).send({
                    status : 'success',
                    topic : topicStore
                })
            })

        }
        else {
            return res.status(400).send({
                message : 'Los datos no son validos'
            })
        }
    },

    getTopics : function (req,res) {
        // Cargar la libreria de paginacion en la clase (MODELO)

        // Recoger la pagina actual
        if(req.params.page == null || req.params.page == undefined || !req.params.page) {
            var page = 1
        }
        else {
            var page = parseInt(req.params.page)
        }

        // Indicar las opciones de paginacion
        var options = {
            sort : { date : -1}, // orden ascendente (1) o descendente (-1)
            populate : 'user',
            limit : 5,
            page : page
        }

        // Find paginado
        
        Topic.paginate({},options, (error, topics) => {

            if(error){
                return res.status(500).send({
                    status: 'error',
                    message : 'Error al hacer la consulta'
                })
            }

            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message : 'No hay topics'
                })
            }

            // Devolver resultado (topics, total de topics y total de paginas)
    
            return res.status(200).send({
                status : 'success',
                topics : topics.docs,
                totalDocs: topics.totalDocs,
                totalPages : topics.totalPages
            })
        })

    },

    getTopicByUser : function (req,res) {
        // Conseguir el id del usuario
        var userId = req.params.user

        // Find con la condicion de usuario
        
        Topic.find({ user : userId})
            .sort([['date','descending']])
            .exec((error,topics) => {
                if(error) {
                    res.status(404).send({
                        status : 'error',
                        message : 'Error en la peticion'
                    })
                }
                else if(!topics) {
                    res.status(404).send({
                        status : 'error',
                        message : 'No hay temas para mostrar'
                    })
                }
                else {
                    // Devolver resultado
                    res.status(200).send({
                        status : 'success',
                        topics 
                    })
                }
                
            })
    },

    getTopic : function (req,res) {
        // Sacar el id del topic de la url
        var topicId = req.params.id

        // Find por id del topic
        Topic.findById(topicId)
            .populate('user')
            .populate('comments.user')
            .exec((error,topic) => {
                if(error){
                    return res.status(500).send({
                        message : 'Error en la peticion'
                    })
                }
                if(!topic){
                    return res.status(404).send({
                        message : 'Topic no existente'
                    })
                }
                
                // Devolver el resultado
                return res.status(200).send({
                    status : 'success',
                    topic
                })
            })
    },

    update : function (req,res) {
        // Recoger el id del topic
        var topicId = req.params.id
        
        // Recoger los datos que llegan 
        var data = req.body

        // Validar datos 
        try {
            var validate_title = !validator.isEmpty(data.title);
            var validate_content = !validator.isEmpty(data.content);
            var validate_lang = !validator.isEmpty(data.lang);
        }
        catch(error) {
            return res.status(404).send({
                status : 'error',
                message : 'Faltan datos por enviar'
            })
        }

        if (validate_title && validate_content && validate_lang) {

            // Montar un JSON con los datos modificables
            var update = {
                title : data.title,
                content : data.content,
                code : data.code,
                lang : data.lang
            }
            // Find and update del topic por id y por id de usuario
            Topic.findOneAndUpdate({ _id : topicId , user : req.user.sub}, update, {new:true}, (error,topicUpdate) => {
                if(error){
                    return res.status(500).send({
                        status: 'error',
                        message : 'Error en la peticion'
                    })
                }
                if(!topicUpdate){
                    return res.status(404).send({
                        status : 'error',
                        message : 'Error al actualizar'
                    })
                }

                // Devolver respuesta
                return res.status(200).send({
                    status : 'success',
                    topic : topicUpdate
                })
            })
    
        }
        else {
            return res.status(404).send({
                message : 'La validacion de los datos no es correcta'
            })
        }

    },

    delete : function (req,res) {
        // Sacar el id del topic de la url
        var topicId = req.params.id

        // Find and delete por topic id y por user id
        Topic.findOneAndDelete({ _id : topicId, user : req.user.sub },(error,topicRemoved) => {
            if(error) {
                return res.status(500).send({
                    status : 'error',
                    message : 'Error en la peticion'
                })
            }
            if(!topicRemoved) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No se actualizo el tema'
                })
            }

            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                topic : topicRemoved
            })
        })
    },

    search : function (req,res) {
        // Sacar el string a buscar
        var searchString = req.params.search

        // Find or 
        Topic.find({
            "$or" : [
                { "title" : { "$regex" : searchString, "$options": "i" } },
                { "content" : { "$regex" : searchString, "$options": "i" } },
                { "lang" : { "$regex" : searchString, "$options": "i" } },
                { "code" : { "$regex" : searchString, "$options": "i" } },
                { "comments.content": { "$regex": searchString, "$options": "i" } }
            ]
        })
        .populate('user')
        .sort([['date','descending']])
        .exec((error, topics) => {
            if(error) {
                return res.status(500).send({
                    status : 'error',
                    message : 'Error en la peticion'
                })
            }
            if(!topics) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No se encontraron coincidencias'
                })
            }
            // Devolver resultado
            return res.status(200).send({
                status : 'success',
                topics ,
                searchString
            })
        })
    }
}

module.exports = topicController;