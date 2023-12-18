class Projectile {
    constructor({x, y, color, radius, velocity}) {
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
        this.velocity = velocity
    }

    update() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

    draw () {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
        c.fillStyle = this.color
        c.fill()
    }
}