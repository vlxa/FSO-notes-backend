const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async ({ body }, response) => {
  if (body.password.length >= 8) {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } else {
    response.status(400).json({ error: 'Password too short, use at least 8 characters' })
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('notes', { content: 1, date: 1 })

  response.json(users)
})

module.exports = usersRouter
