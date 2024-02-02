const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initlaizeAndDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at https://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error ${error.message}`)
    process.exit(1)
  }
}
initlaizeAndDbServer()

const camelCaseFunction = responseObj => {
  //convet keys snake-case to camelCase
  return {
    playerId: responseObj.player_id,
    playerName: responseObj.player_name,
    jerseyNumber: responseObj.jersey_number,
    role: responseObj.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuerys = `SELECT * FROM cricket_team ORDER BY player_id;`
  const getPlayersArrayList = await db.all(getPlayerQuerys)
  response.send(getPlayersArrayList.map(eachObj => camelCaseFunction(eachObj))) //for multiple obj we need to iterate
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails
  const playerQuery = `INSERT INTO 
                          cricket_team (player_name,jersey_number, role) 
                       VALUES(
                          '${playerName}',
                          ${jerseyNumber},
                          '${role}');`
  const getPlayerDetails = await db.run(playerQuery)
  const playerId = getPlayerDetails.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId}`
  const getPlayer = await db.get(getplayerQuery)
  console.log(getPlayer)
  response.send(camelCaseFunction(getPlayer)) //single obj no need to iterate
})

app.put('/players/:playerId/', async (request, response) => {
  const playerDetails = request.body
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `UPDATE
                               cricket_team
                            SET 
                                player_name='${playerName}',
                                jersey_number=${jerseyNumber} ,
                                role= '${role} '
                            WHERE 
                                player_id=${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId}`
  await db.get(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
