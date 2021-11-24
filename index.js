require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(express.json())
app.use(cors())

const url = process.env.MONGODB_URI
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Note = mongoose.model('Note', noteSchema)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = +request.params.id
  const note = notes.find((note) => note.id === id)
  if (note) {
    response.json(note)
  } else {
    response.statusMessage = `Note "${id}" does not exist.`
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = +request.params.id
  notes = notes.filter((note) => note.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId =
    notes.length > 0 //force-wrap
      ? Math.max(...notes.map((n) => n.id))
      : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

const PORT = process.env.port || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
