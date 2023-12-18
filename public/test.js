const canvas = document.querySelector('canvas')
var started = false;
canvas.addEventListener("click",() => {
    if (!started) {
        requestAnimationFrame(updateFrame);
        started = true;
    }
})
const ctx = canvas.getContext("2d", {aplha:false});// aplha:false to avoid unneeded composition
ctx.font = "16px arial";
ctx.textAlign = "center";
fillBackground();
ctx.fillStyle = "white"
ctx.fillText("Click to Start", ctx.canvas.width / 2, ctx.canvas.height / 2);

document.addEventListener("keydown", keyboardEvent);
document.addEventListener("keyup", keyboardEvent);
const keys = {ArrowUp: false, ArrowLeft: false, ArrowRight: false}
function keyboardEvent(event) {
    if(keys[event.code] !== undefined) {
        event.preventDefault();
        keys[event.code] = event.type === "keydown";
    }
}
const width = 20, height = 20;
const TURN_RATE = 0.01; // in radians
const MAX_TURN_RATE = 0.1; // in radians
const REACTOR_WINDUP_RATE = 0.01; // in power units per frame
const REACTOR_MAX_POWER = 0.1; // in pixels per frame (frame = 1/60th sec)
const SPACE_QUANTUM_FLUX = 0.015; // drains ship moment per frame
const DEFLUXING_CONVERTER = 0.8; // How dirty the thruster is
const SHIP_HULL = [-width*(1/3), -height/2, width*(2/3), 0, -width*(1/3), height/2,"close"];
const SHIP_PORT = [width*(1/6), -height/8, width*(1/3), 0, width*(1/6), height/8,"close"];

const thrustParticlePool = [];
const thrustParticle = {
    get pos() { return {x:0, y:0} },
    get vel() { return  {x:0, y:0} },
    shape: createPath([-0.5,0,0.5,0]),
    style: "#FFF",
    rotate: 0,
    pool: thrustParticlePool,    
    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.vel.x *= 0.996;
        this.vel.y *= 0.996;       
        this.life -= 1;
    },
    init(x,y,direction, speed) {
        const offCenter = Math.random()**2 * (Math.random() < 0.5 ? -1 : 1);
        const offCenterA = Math.random()**2 * (Math.random() < 0.5 ? -1 : 1);
        speed += speed * offCenterA;
        speed **= 2.5;
        this.pos.x = x + Math.cos(direction) * width * (2/3) - Math.sin(direction) * height * (1/6) * offCenter;
        this.pos.y = y + Math.sin(direction) * width * (2/3) + Math.cos(direction) * height * (1/6) * offCenter;
        direction += direction * 0.1 * offCenter;
        this.rotate = direction;
        this.vel.x = Math.cos(direction) * speed;
        this.vel.y = Math.sin(direction) * speed;
        this.life = 100;
    },
};
const particles = Object.assign([],{
    add(type,...args) {
        var p;
        if(type.pool.length) {
            p = type.pool.pop();
        } else {
            p = Object.assign({}, type);
        }
        p.init(...args);
        this.push(p);
    },
    updateDraw() {
        var i = 0
        while(i < this.length) {
             const p = this[i];
             p.update();
             if (p.life <= 0) {
                 this.splice(i--,1)[0];
                 if (p.pool) { p.pool.push(p) }
             } else {
                 strokeShape(p.shape, p.pos, p.rotate, 1, p.style);
             }
             
             i++;
         }
     }
});


function createPath(...paths) {
    var i, path = new Path2D;
    for(const points of paths) {
        i = 0;
        path.moveTo(points[i++],points[i++]) 
        while (i < points.length -1) { path.lineTo(points[i++],points[i++]) }
        points[i] === "close" && path.closePath(); 
    }
    return path;
}
const ship	= {
    shapes: {
        normal: createPath(SHIP_HULL s),
        thrustingA: createPath(SHIP_HULL, SHIP_PORT,
            [-width*(1/3), -height/4, -width*(1/3)-height/4,0, -width*(1/3), height/4]
         ),
        thrustingB: createPath(SHIP_HULL, SHIP_PORT,
            [-width*(1/3), -height/3.5, -width*(1/3)-height/2.4,0, -width*(1/3), height/3.5]
         ),         
    },
    shape: null,
    rotate: 0, // point left to right along x axis
    deltaRotate: 0,
    pos: {x : 200, y: 100},
    vel: {x : 0, y: 0},
    power: 0,
    style: "#FFF", // named colours take about 10% longer to set than Hex colours
    update() {
        if (keys.ArrowUp) {
           this.shape = this.shapes.thrustingA === this.shape ? this.shapes.thrustingB : this.shapes.thrustingA; 
           this.power = this.power < REACTOR_MAX_POWER ? this.power + REACTOR_WINDUP_RATE : REACTOR_MAX_POWER;
           if (Math.random() < DEFLUXING_CONVERTER) {
              particles.add(
                  thrustParticle,
                  this.pos.x, this.pos.y,
                  this.rotate + Math.PI,
                  this.power * 8,
               );
           }
           
        } else {
           this.shape = this.shapes.normal;
           this.power = 0;
        }
        var dr = this.deltaRotate;
        dr *= 0.95;
        dr = keys.ArrowLeft ?  dr - TURN_RATE : dr;
        dr = keys.ArrowRight ?  dr + TURN_RATE : dr;
        dr = Math.abs(dr) > MAX_TURN_RATE ? MAX_TURN_RATE * Math.sign(dr) : dr;
        this.rotate += (this.deltaRotate = dr);
        this.vel.x += Math.cos(this.rotate) * this.power;
        this.vel.y += Math.sin(this.rotate) * this.power;
        const speed = (this.vel.x * this.vel.x + this.vel.y * this.vel.y)**4;
        if (speed > 0.0) {
            this.vel.x = this.vel.x * (speed / (speed * (1+SPACE_QUANTUM_FLUX)));
            this.vel.y = this.vel.y * (speed / (speed * (1+SPACE_QUANTUM_FLUX)));
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        
        this.pos.x = (this.pos.x + ctx.canvas.width * 2) % ctx.canvas.width;
        this.pos.y = (this.pos.y + ctx.canvas.height * 2) % ctx.canvas.height;
    },
    draw() {
        strokeShape(ship.shape, ship.pos, ship.rotate, 1, ship.style);
    }
};
function strokeShape(shape, pos, rotate = 0, scale = 1, style = ctx.strokeStyle) {
    const xAx = Math.cos(rotate) * scale;  // direction and size of the top of a 
    const xAy = Math.sin(rotate) * scale;  // single pixel
    ctx.setTransform(xAx, xAy, -xAy, xAx, pos.x, pos.y); // one state change
    ctx.strokeStyle = style;
    ctx.stroke(shape);
}
function fillBackground() {
    ctx.fillStyle = "#000";
    ctx.setTransform(1,0,0,1,0,0); //ensure that the GPU Transform state is correct
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
function updateFrame(time) {
    fillBackground();
    ship.update();
    ship.draw();
    requestAnimationFrame(updateFrame);
}