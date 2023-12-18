class Star {
    constructor({x, y, color= "#FFF", radius=2}) {
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
    }

    draw (xCameraOffset = 0, yCameraOffset = 0) {
        c.beginPath()
        c.arc(this.x - xCameraOffset, this.y - yCameraOffset, this.radius, 0, Math.PI *2, false)
        c.fillStyle = this.color
        c.fill()
    }
}