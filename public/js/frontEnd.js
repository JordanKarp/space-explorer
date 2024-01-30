const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const GLOBALS = {
  keys: {
    up: { pressed: false },
    left: { pressed: false },
    right: { pressed: false },
  },
  ship: {
    thrust: 0.02,
    turn_speed: 0.05
  },
  mapAnchor: { x: 0, y: 0},
  deltaAnchor: { x: 0, y: 0 }
}
const stars = []
const frontEndPlayers = {};
const frontEndProjectiles = {};


function init() {
  const devicePixelRatio = window.devicePixelRatio || 1
  canvas.width = 600 * devicePixelRatio
  canvas.height = 500 * devicePixelRatio
  
  c.scale(devicePixelRatio, devicePixelRatio)


  // for (let i=0; i<200; i++)
  //   stars.push(new Star({
  //     x: 2400 * Math.random() - 1200,
  //     y: 2000 * Math.random() - 1000,
  //     radius: 1,
  //     distanceFactor: .2 * Math.random()
  //   }))
  for (let i=0; i<400; i++)
    stars.push(new Star({
      x: 2400 * Math.random() - 1200,
      y: 2000 * Math.random() - 1000,
      // radius: 2
      radius: Math.ceil(2 * Math.random()),
      distanceFactor: Math.random()
      // distanceFactor: Math.round(5 * Math.random())
    }))
  
  setInterval(() => {
    if (GLOBALS.keys.up.pressed) {
      // frontEndPlayers[socket.id].power = GLOBALS.ship.thrust
      socket.emit('keydown', {keycode: 'ArrowUp'})
    }
    if (GLOBALS.keys.left.pressed) {
      // frontEndPlayers[socket.id].deltaRotation = -GLOBALS.ship.turn_speed
      socket.emit('keydown', {keycode: 'ArrowLeft'})
    }
    if (GLOBALS.keys.right.pressed) {
      // frontEndPlayers[socket.id].deltaRotation = GLOBALS.ship.turn_speed
      socket.emit('keydown', {keycode: 'ArrowRight'})
    }
    socket.emit('updatePlayer')
    console.log(socket.id)
    GLOBALS.mapAnchor.x = -canvas.width/2 + frontEndPlayers[socket.id].x
    GLOBALS.mapAnchor.y = -canvas.height/2 + frontEndPlayers[socket.id].y
  }, 15)



  window.addEventListener('keydown', (event) => {
    if (!frontEndPlayers[socket.id]) return
  
    switch(event.code) {
      case 'ArrowUp':
        // frontEndPlayers[socket.id].power = 0
        GLOBALS.keys.up.pressed = true
        break
      case 'ArrowLeft':
        // frontEndPlayers[socket.id].deltaRotation = 0
        GLOBALS.keys.left.pressed = true
        break
      case 'ArrowRight':
        // frontEndPlayers[socket.id].deltaRotation = 0
        GLOBALS.keys.right.pressed = true
        break
    }
  })
  window.addEventListener('keyup', (event) => {
    if (!frontEndPlayers[socket.id]) return
  
    switch(event.code) {
      case 'ArrowUp':
        GLOBALS.keys.up.pressed = false
        socket.emit('keyup', {keycode: 'ArrowUp'})
        break
      case 'ArrowLeft':
        GLOBALS.keys.left.pressed = false
        socket.emit('keyup', {keycode: 'ArrowLeft'})
        break
      case 'ArrowRight':
        GLOBALS.keys.right.pressed = false
        socket.emit('keyup', {keycode: 'ArrowRight'})
        break
    }
  })

  socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
      const backEndPlayer = backEndPlayers[id]
      // console.log(backEndPlayer.x, backEndPlayer.y)
      if (!frontEndPlayers[id]) {
        frontEndPlayers[id] = new Player({
          id: id,
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          color: backEndPlayer.color,
          rotation: backEndPlayer.rotation,
          power: backEndPlayer.power
        })
      } else {
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y
        frontEndPlayers[id].power = backEndPlayer.power
        frontEndPlayers[id].rotation = backEndPlayer.rotation
        frontEndPlayers[id].deltaRotation = backEndPlayer.deltaRotation
        frontEndPlayers[id].velocity = backEndPlayer.velocity
      }
    }
    for (const id in frontEndPlayers) {
      if (!backEndPlayers[id]) {
        delete frontEndPlayers[id]
      }
    }
  })
}

function renderBackground() {
  fillBackground('#000')
  stars.forEach((star) => {
    star.draw(GLOBALS.mapAnchor.x, GLOBALS.mapAnchor.y)
  })
}

function renderProps() {
  // for (const id in frontEndProjectiles) {
  //   const frontEndProjectile = frontEndProjectiles[id]
  //   frontEndProjectile.update()
  //   frontEndProjectile.draw()

}

function renderCharacters() {
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]
    // now done on back end
    frontEndPlayer.update()
    if (id == socket.id) {
      frontEndPlayer.draw_centered()
    } else {
      frontEndPlayer.draw(GLOBALS.mapAnchor.x,GLOBALS.mapAnchor.y)
    }
  }
}

function renderUI() {

}

// main function to be run for rendering frames
function mainLoop() {
  // erase entire canvas
  c.clearRect(0,0,canvas.width,canvas.height);

  // render each type of entity in order, relative to layers
  renderBackground();
  renderProps();
  renderCharacters();
  renderUI();

  // rerun function (call next frame)
  window.requestAnimationFrame(mainLoop);
}

init(); // initialize game settings
mainLoop(); // start running frames