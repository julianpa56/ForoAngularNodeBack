'use strict'
var Topic = require('../models/topic')
var validator = require('validator')


var commentController = {
    add : function (req,res) {
        // Recoger el id del topic de la url
        var topicId = req.params.topicId

        // Find por id del topic
        Topic.findById(topicId).exec((error, topic) => {
            if(error) {
                return res.status(500).send({
                    status : 'error',
                    message : 'Error en la peticion'
                })
            }
            if(!topic) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No existe el tema',
                    topicId
                })
            }
            // Comprobar objeto usuario y validar datos
            if(req.body.content) {
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                }
                catch(error) {
                    return res.status(404).send({
                        status : 'error',
                        message : 'No has comentado nada'
                    })
                }
            }

            if (validate_content) {
                var comment = {
                    user : req.user.sub,
                    content : req.body.content
                }
                
                // En la propiedad comments del objeto resultante hacer un push
                topic.comments.push(comment)
                // Guardar el topic completo
                topic.save((error) => {
                    if(error){
                        return res.status(500).send({
                            status : 'error',
                            message : 'Error al guardar el comentario'
                        })
                    }
                    // Devolver respuesta
                    return res.status(200).send({
                        status : 'success',
                        topic
                    })
                })
            }
            else {
                return res.status(404).send({
                    status : 'error',
                    message : 'No has comentado nada'
                })
            }
        })
    },

    update : function (req,res) {
        // Conseguir el id del comentario de la url
        var commentId = req.params.commentId

        // Recoger datos y validar
        var params = req.body
        try {
            var validate_content = !validator.isEmpty(params.content);
        }
        catch(error) {
            return res.status(404).send({
                status : 'error',
                message : 'No has comentado nada'
            })
        }

        if(validate_content) {

            // Find and update de un subdocumento
            Topic.findOneAndUpdate(
                {
                    "comments._id" : commentId
                },
                {
                    "$set" : {
                        "comments.$.content" : params.content 
                    }
                },
                {new:true},
                (error , topicUpdated) => {
                    if(error) {
                        return res.status(500).send({
                            status : 'error',
                            message : 'Error al realizar la peticion'
                        })
                    }
                    if(!topicUpdated) {
                        return res.status(404).send({
                            status : 'error',
                            message : 'Error al actualizar comentario'
                        })
                    }
                    // Devolver respuesta
                    return res.status(200).send({
                        status : 'success',
                        topic : topicUpdated
                    })
                })
        }

    },

    delete : function (req,res) {
        // Sacar el id del topic y del comentario a borrar
        var topicId = req.params.topicId
        var commentId = req.params.commentId

        // Buscar el topic 
        Topic.findById(topicId,(error, topic) => {
            if(error) {
                return res.status(500).send({
                    status : 'error',
                    message : 'Error al realizar la peticion'
                })
            }
            if(!topic) {
                return res.status(404).send({
                    status : 'error',
                    message : 'No existe el tema'
                })
            }
            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId)

            // Borrar el comentario 
            if (comment) {
                comment.remove()
                // Guardar el topic
                topic.save((error) => {
                    if(error) {
                        return res.status(500).send({
                            status : 'error',
                            message : 'Error al realizar la peticion'
                        })
                    }
                    else{
                        // Devolver respuesta
                        return res.status(200).send({
                            status : 'success',
                            message : 'Comentario eliminado',
                            topic
                        })
                    } 
                })
            }
            else {
                return res.status(404).send({
                    status : 'error',
                    message : 'No existe el comentario'
                })
            }
        })
    },
}

module.exports = commentController