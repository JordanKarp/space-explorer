class Player {
    constructor({id, x, y, color}) {
        this.id = id
        this.x = x
        this.y = y
        this.color = color
        this.radius = 16
        this.velocity = {x:0, y:0}
        this.rotation = 0
        this.deltaRotation = 0
        this.power = 0
        this.shape = createPath([-this.radius*(1/3), -this.radius/2, this.radius, 0, -this.radius*(1/3), this.radius/2,"close"])
        this.thrustShape = createPath([-this.radius*(1/3), -this.radius/3.5, -this.radius*(1/3)-this.radius/2,0, -this.radius*(1/3), this.radius/3.5])
        this.keys = {ArrowUp: false, ArrowLeft: false, ArrowRight: false}
    }

    // keyboardEvent(event) {
    //     if(this.keys[event.code] !== undefined) {
    //         console.log(event.type)
    //         event.preventDefault();
    //         this.keys[event.code] = event.type === "keydown";
    //     }
    // }
    

    update_velocity (){
        this.velocity.x += Math.cos(this.rotation) * this.power
        this.velocity.y += Math.sin(this.rotation) * this.power
        // add space friction
    }
    update_rotation (){
        // var dr = this.deltaRotation;
        // dr *= 0.95;
        // dr = keys.ArrowLeft ?  dr - TURN_RATE : dr;
        // dr = keys.ArrowRight ?  dr + TURN_RATE : dr;
        // dr = Math.abs(dr) > MAX_TURN_RATE ? MAX_TURN_RATE * Math.sign(dr) : dr;
        // this.rotation += (this.deltaRotation = dr);
        this.rotation += this.deltaRotation;
        // console.log(this.rotation)
    }
    update_position (){
        this.x += this.velocity.x
        this.y += this.velocity.y
    }

    update() {
        this.update_velocity()
        this.update_rotation()
        this.update_position()
    }


    draw_centered() {
        if (this.power) {
            strokeShape(this.thrustShape, {x: canvas.width/2, y:canvas.height/2}, this.rotation, 1, '#ffffff');
        }
        strokeShape(this.shape, {x: canvas.width/2, y:canvas.height/2}, this.rotation, 1, this.color);
    }
    draw (xCameraOffset, yCameraOffset) {
        if (this.power) {
            strokeShape(this.thrustShape, {x: this.x - xCameraOffset, y:this.y - yCameraOffset}, this.rotation, 1, '#ffffff');
        }
        strokeShape(this.shape, {x: this.x -xCameraOffset, y:this.y-yCameraOffset}, this.rotation, 1, this.color);
    }
}

