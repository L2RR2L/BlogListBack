
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const logger = require('./logger')
const config = require('./config')

const requestLogger = (request, reponse, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' })

    if (error.name === 'ValidationError') return response.status(400).send({ error: error.message })

    if (error.name == "JsonWebTokenError") return response.status(401).send({ error: error.message })

    next(error)
}

const tokenExtractor = (request, response, next) => {

    try {
        const authorization = request.get('authorization')
        if (authorization && authorization.startsWith('Bearer')) {
            request.token = authorization.replace('Bearer ', '')
        }
        next()
    } catch (error) {
        next(error)
    }
}

const userExtractor = async (request, response, next) => {

    if (request.token !== undefined) {

        const decodedToken = jwt.verify(request.token, config.SECRET)
        if (!decodedToken.id) return response.status(401).json({ error: "invalid jwt token" })

        const user = await User.findById(decodedToken.id)
        request.user = user

        next()
    }
    else response.status(401).json({ error: "invalid json token" })

}


module.exports = { requestLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor }
