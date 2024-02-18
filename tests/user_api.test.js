

const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('test', 10)
        const user = new User({ name: 'test', username: 'test', passwordHash })

        await user.save()
    })

    test('a user can be created', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'userme',
            name: 'mee',
            password: '123456',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails if username is already taken', async () => {

        const passwordHash = await bcrypt.hash('tes', 10)
        const user = new User({ name: 'tes', username: 'tes', passwordHash })
        user.save()

        const initialUsers = await helper.usersInDb()

        const DuplicateUser = {
            username: "tes",
            name: "tes",
            password: "tes"
        }

        const result = await api
            .post('/api/users')
            .send(DuplicateUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const finalUsers = await helper.usersInDb()

        expect(finalUsers).toEqual(initialUsers)

    })

    test('creations fails if username or password length is less than 3', async () => {

        const initialUsers = await helper.usersInDb()

        const user = {
            username: "te",
            name: "test",
            password: "te"
        }

        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)

        const finalUsers = await helper.usersInDb()

        expect(finalUsers).toEqual(initialUsers)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})