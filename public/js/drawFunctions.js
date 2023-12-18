function strokeShape(shape, pos, rotate = 0, scale = 1, style = c.strokeStyle) {
    const xAx = Math.cos(rotate) * scale;  // direction and size of the top of a 
    const xAy = Math.sin(rotate) * scale;  // single pixel
    c.setTransform(xAx, xAy, -xAy, xAx, pos.x, pos.y); // one state change
    c.strokeStyle = style;
    c.fillStyle = style;
    c.stroke(shape);
    c.fill(shape);

}

function fillBackground(color = '#000') {
    c.fillStyle = color;
    c.setTransform(1,0,0,1,0,0); //ensure that the GPU Transform state is correct
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
}

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

