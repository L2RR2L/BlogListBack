
const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const config = require('../utility/config')
const middleware = require('../utility/middleware')
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')

//   if (authorization && authorization.startsWith('Bearer')) {
//     return authorization.replace('Bearer ', '')
//   }

//   return null
// }

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const blog = await Blog
      .findById(id)
      .populate('user', { username: 1, name: 1 })
    if (blog) response.json(blog)
    else response.status(404).end()
  }
  catch (error) {
    next(error)
  }
})

blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  try {

    // const decodedToken = jwt.verify(request.token, config.SECRET)

    // if (!decodedToken.id) return response.status(401).json({ error: "invalid token" })


    const body = request.body

    // const user = await User.findById(decodedToken.id)

    const user = request.user


    const blog = new Blog({
      title: body.title,
      author: body.author,
      ...(body.url && { url: body.url }),
      likes: body.likes || 0,
      // user: user.id
      user: user.id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    response.status(201).json(savedBlog)
  }
  catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  const id = request.params.id

  try {
    // const decodedToken = jwt.verify(request.token, config.SECRET)
    // if (!decodedToken.id) response.status(401).json({ error: 'invalid token' })

    // await Blog.findByIdAndDelete(id)

    await User.findByIdAndUpdate(request.user.id, { $pull: { blogs: id } })

    await Blog.findByIdAndDelete(id)

    response.status(204).end()
  }
  catch (error) {
    next(error)
  }
})


blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    ...(body.url && { url: body.url }),
    likes: body.likes || 0
  }


  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true, runValidators: true, context: 'query' })
    response.json(updatedBlog)
  }
  catch (error) {
    next(error)
  }


}
)


module.exports = blogsRouter