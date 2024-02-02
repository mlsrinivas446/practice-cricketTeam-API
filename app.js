const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const playersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details`
  const playerDetails = await db.all(playersQuery)
  response.send(playerDetails)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details WHERE player_id=${playerId}`
  const playerDetails = await db.get(playersQuery)
  response.send(playerDetails)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const playersQuery = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId}`
  const playerDetails = await db.get(playersQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const playersQuery = `SELECT match_id AS matchId,match AS match,year AS year FROM match_details WHERE match_id=${matchId}`
  const playerDetails = await db.get(playersQuery)
  response.send(playerDetails)
})

app.get(`/players/:playerId/matches`, async (request, response) => {
  const {playerId} = request.params
  const playersQuery = `SELECT match_id AS matchId,match AS match,year AS year FROM match_details NATURAL JOIN player_match_score  WHERE player_id=${playerId}`
  const playerDetails = await db.all(playersQuery)
  response.send(playerDetails)
})

app.get(`/matches/:matchId/players`, async (request, response) => {
  const {matchId} = request.params
  const playersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_match_score NATURAL JOIN player_details  WHERE match_id=${matchId}`
  const playerDetails = await db.all(playersQuery)
  response.send(playerDetails)
})

app.get(`/players/:playerId/playerScores`, async (request, response) => {
  const {playerId} = request.params
  const playersQuery = `SELECT player_id AS playerId,player_name AS playerName,SUM(score) AS totalScore,SUM(fours) AS totalFours,SUM(sixes) AS totalSixes FROM player_match_score INNER JOIN player_details  WHERE player_id=${playerId};`
  const playerDetails = await db.all(playersQuery)
  response.send(playerDetails)
})

module.exports = app
