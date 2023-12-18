const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000})

const port = 4000

const backEndPlayers = {}
const THRUST = .02
const TURN_SPEED = .05

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`)

    backEndPlayers[socket.id] = {
        x: 500,
        y: 500,
        color: `hsl(${360 * Math.random()}, 100%, 50%)`, 
        rotation:0,
        deltaRotation:0,
        power: 0,
        velocity: {x:0, y:0}
    }
    io.emit('updatePlayers', backEndPlayers)

    socket.on('disconnect', (reason) => {
        delete backEndPlayers[socket.id]
        io.emit('updatePlayers', backEndPlayers)
    })
    
    socket.on('keydown', ({keycode}) => {
      switch(keycode) {
        case 'ArrowUp':
          backEndPlayers[socket.id].power = THRUST
          break
        case 'ArrowLeft':
          backEndPlayers[socket.id].deltaRotation = -TURN_SPEED
          break
        case 'ArrowRight':
          backEndPlayers[socket.id].deltaRotation = TURN_SPEED
          break
        }
    })
    socket.on('keyup', ({keycode}) => {
      switch(keycode) {
        case 'ArrowUp':
          backEndPlayers[socket.id].power = 0
          break
        case 'ArrowLeft':
          backEndPlayers[socket.id].deltaRotation = 0
          break
        case 'ArrowRight':
          backEndPlayers[socket.id].deltaRotation = 0
          break
        }
    })
    socket.on('updatePlayer', () => {
        if (!backEndPlayers[socket.id]) return

        const backEndPlayer = backEndPlayers[socket.id]
        // console.log(backEndPlayer)
  
        backEndPlayer.velocity.x += Math.cos(backEndPlayer.rotation) * backEndPlayer.power
        backEndPlayer.velocity.y += Math.sin(backEndPlayer.rotation) * backEndPlayer.power
        backEndPlayer.rotation += backEndPlayer.deltaRotation;
        backEndPlayer.x += backEndPlayer.velocity.x
        backEndPlayer.y += backEndPlayer.velocity.y
    })
})

setInterval(() => {
  io.emit('updatePlayers', backEndPlayers)
} , 15)



server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})