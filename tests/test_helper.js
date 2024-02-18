
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')

const logger = require('../utility/logger')
const config = require('../utility/config')


const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
    .then(() => { logger.info('connected to mongoDB') })
    .catch(error => logger.info('error connecting to DB: ', error.message))




const initialBlogs = [
    {
        author: 'Dijkstra',
        title: 'shortest path'
    },
    {
        author: 'me',
        title: 'learn'
    }
]


const nonExistingId = async () => {
    const blog = new Blog({ author: 'test', title: 'test' })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb, usersInDb
}