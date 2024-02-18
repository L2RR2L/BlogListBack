const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  // let blogObject = new Blog(helper.initialBlogs[0])
  // await blogObject.save()

  // blogObject = new Blog(helper.initialBlogs[1])
  // await blogObject.save()


  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

})

describe('when there is initially some notes saved', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


  test('all blogs are returned', async () => {
    // const response = await api.get('/api/blogs')
    const response = await helper.blogsInDb()
    expect(response).toHaveLength(helper.initialBlogs.length)
  })


  test('unique identifier of blogs is named Id', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs.every(blog => blog.id)).toBeDefined()
  })


  test('a specific blog can be viewed', async () => {
    const initialBlogs = await helper.blogsInDb()

    const blogToView = initialBlogs[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

})

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {


    // const initialResponse = await api.get('/api/blogs')
    // expect(initialResponse.status).toBe(200)

    // const initialBlogs = initialResponse.body

    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // const response = await api.get('/api/blogs')
    const response = await helper.blogsInDb()
    expect(response).toHaveLength(helper.initialBlogs.length + 1)

    const titles = response.map(r => r.title)
    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })

  test('adding a blog without specifying the likes defaults to 0', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)

    const defaultBlog = { ...newBlog, likes: 0 }

    const blogs = await helper.blogsInDb()

    const blogsWithoutId = blogs.map(({ id, ...rest }) => rest)

    expect(blogsWithoutId).toContainEqual(defaultBlog)
  })


  test('blog without title or author is not added', async () => {

    // const initialResponse = await api.get('/api/blogs')

    // const initialBlogs = initialResponse.body
    const newNote = {}

    await api
      .post('/api/blogs')
      .send(newNote)
      .expect(400)

    // const response = await api.get('/api/blogs')
    const response = await helper.blogsInDb()

    expect(response).toHaveLength(helper.initialBlogs.length)
  })

})




describe('deletion of a blog', () => {
  test('a blog can be deleted', async () => {
    const initialBlogs = await helper.blogsInDb()

    const blogToDelete = initialBlogs[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)


    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)


    const blogDetails = blogsAtEnd.map(blog => ({
      title: blog.title,
      author: blog.author
    }))

    expect(blogDetails).not.toContain({ title: blogToDelete.title, author: blogToDelete.author })
  })
})

describe('update of a blog', () => {
  test('a blog can be updated', async () => {
    const initialBlogs = await helper.blogsInDb()

    const blogToUpdate = { ...initialBlogs[0], title: 'updatedTitle', author: 'updatedAuthor', likes: 777 }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)


    const finalBlogs = await helper.blogsInDb()



    expect(finalBlogs).toContainEqual(blogToUpdate)

  })
})



afterAll(async () => {
  await mongoose.connection.close()
})