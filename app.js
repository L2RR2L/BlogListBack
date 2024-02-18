
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const logger = require('./utility/logger')
const config = require('./utility/config')
const middleware = require('./utility/middleware')


const blogsRouter = require('./controller/blogs')
const usersRouter = require('./controller/users')
const loginRouter = require('./controller/login')
const app = express()


const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
    .then(() => { logger.info('connected to mongoDB') })
    .catch(error => logger.info('error connecting to DB: ', error.message))



app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)
// app.use(middleware.tokenExtractor)
// app.use(middleware.userExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

