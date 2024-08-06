const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/movies/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})
app.get('/directors/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      director_id,director_name
    FROM
      director
    ORDER BY
      director_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})
//Get Book API
app.get('/movies/:movieId/', async (request, response) => {
  const movieId = request.params.movieId
  let query = `SELECT * FROM movie WHERE movie_id=${movieId}`
  let book = await db.get(query)
  response.send(book)
})
console.log('hello')
//Post book

app.post('/movies/', async (request, response) => {
  const bookDetails = request.body
  const {directorId, movieName, leadActor} = bookDetails
  const addBookQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},
  '${movieName}','${leadActor}');`
  await db.run(addBookQuery)
  response.send('Movie Successfully Added')
})
//put
app.put('/movies/:movieId/', async (request, response) => {
  const movieId = request.params.movieId
  const bookDetails = request.body
  const {directorId, movieName, leadActor} = bookDetails
  const addBookQuery = `UPDATE movie SET director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}' WHERE movie_id=${movieId}`
  await db.run(addBookQuery)
  response.send('Movie Details Updated')
})
//delete
app.delete('/movies/:movieId/', async (request, response) => {
  const movieId = request.params.movieId
  const query = `DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(query)
  response.send('Movie Removed')
})
//authorbook
app.get('/directors/:directorId/movies/', async (request, response) => {
  const directorId = request.params.directorId
  const query = `SELECT movie_name FROM movie WHERE movie_id=${directorId};`
  const result = await db.all(query)
  response.send(result)
})
module.exports = app
