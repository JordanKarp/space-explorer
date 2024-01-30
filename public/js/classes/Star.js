class Star {
    constructor({x, y, color= "#FFF", radius=2, distanceFactor=1}) {
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
        this.distanceFactor = distanceFactor
    }

    draw (xCameraOffset = 0, yCameraOffset = 0) {
        c.beginPath()
        const x = this.x - (xCameraOffset * this.distanceFactor)
        const y = this.y - (yCameraOffset * this.distanceFactor)

        c.arc(x, y, this.radius, 0, Math.PI *2, false)
        c.fillStyle = this.color
        c.fill()
    }
}