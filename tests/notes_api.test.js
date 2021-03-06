const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Note = require('../models/note')

beforeEach(async () => {
  await Note.deleteMany({})
  // notes to be saved in order
  /* eslint-disable no-restricted-syntax */
  for (const note of helper.initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save() // eslint-disable-line no-await-in-loop
  }
})

describe('Access and view notes', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')
    const contents = response.body.map((r) => r.content)
    expect(contents).toContain(
      'Browser can execute only Javascript',
    )
  })
})

describe('View specific note', () => {
  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    expect(resultNote.body).toEqual(processedNoteToView)
  })
})

describe('Adding notes', () => {
  test('a valid note can be added ', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    const { body: { token } } = await api
      .post('/api/login')
      .send({
        username: 'vlxa',
        password: 'vlxapasswd',
      })

    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    const contents = notesAtEnd.map((n) => n.content)
    expect(contents).toContain(
      'async/await simplifies making async calls',
    )
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true,
    }

    const { body: { token } } = await api
      .post('/api/login')
      .send({
        username: 'vlxa',
        password: 'vlxapasswd',
      })

    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

describe('Delete note', () => {
  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1,
    )

    const contents = notesAtEnd.map((r) => r.content)
    expect(contents).not.toContain(noteToDelete.content)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
