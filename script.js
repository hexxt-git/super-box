function rdm (max){
    return Math.floor(Math.random()*(max +1));
};
function random ( min, max, floor){
    if (floor) return Math.floor((Math.random()*(max - min + 1)) + min);
    return (Math.random()*(max - min)) + min;
};
function rdmAround (x, floor){
    if (floor) return Math.floor( Math.random()* x * 2 - x )
    return Math.random()* x * 2 - x
}
function write (input){
    console.log('%c' +  JSON.stringify(input), 'color: #8BF');
    return void 0;
};
function error (input){
    console.log('%c' + JSON.stringify(input), 'color: #F54;');
    return void 0;
};
function $ (id){
    return document.getElementById(id);
};
function randomColor (){
    return `hsl( ${rdm(360)}, ${random( 20, 70, true)}%, 50%)`
}

let canvas = $('canvas')
let c = canvas.getContext('2d')
let width = $('container').clientWidth
let height = $('container').clientHeight
let fps = 1000

canvas.width = width
canvas.height = height

c.fillStyle = '#CCC'
c.strokeStyle = '#CCC'

let mouse = {
    x: width/2,
    y: height/2,
    z: false
}
canvas.addEventListener( 'mousemove', ( event)=>{
    mouse.x = event.x
    mouse.y = event.y
})
canvas.addEventListener( 'mousedown', ()=>{
    mouse.z = true
})
canvas.addEventListener( 'mouseup', ()=>{
    mouse.z = false
})

let types = {
    air: {
        hueRange: [ 0, 255 ],
        alphaRange: [ 0, 1 ],
    },
    sand: {
        hueRange: [ 15, 50 ],
        alphaRange: [ 90, 100],
    },
    water: {
        hueRange: [ 225, 240 ],
        alphaRange: [ 60, 80],
    },
}
let typesList = []
for ( let i in types) typesList.push(i)

class Cell{
    constructor(type){
        this.type = type
        this.vx = 0
        this.vy = 0
        this.style = `hsla(${random(types[this.type].hueRange[0],types[this.type].hueRange[1], 1)}, 50%, 50%, ${random(types[this.type].alphaRange[0],types[this.type].alphaRange[1], 1)}%)`
    }
}

let renderMap = (map)=>{
    for ( let y in map ){
        for ( let x in map[y] ){
            c.fillStyle = map[y][x].style
            c.fillRect( x ,y , 1, 1)
        }
    }
}

let updateMap = (map)=>{
    let deltaMap = []
    for ( let y in map ){
        deltaMap.push([])
        for ( let x in map[y] ){
            deltaMap[y].push(map[y][x])
        }
    }
    //add another for loop to update the velocity
    for ( let y in map ){
        if ( map[y] == undefined) continue
        for ( let x in map[y] ){
            if ( map[y][x] == undefined) continue
            switch (map[y][x].type) {
                case 'sand':{
                    map[y][x].vx = 15
                    if( map[y-1] == undefined ) break
                    if(map[y-1][x].type == 'air'){
                        //deltaMap[y][x].vy = 1
                    }
                    break;
                }
                default:{
                    break
                };
            }
        }
    }

    for ( let y = 0 ; y < map.length ; y++ ){
        for ( let x = 0 ; x < map[y].length ; x++ ){
            if( map[y][x].type != 'air' ){
                let moved = false;
                for ( let Y = y+map[y][x].vy ; Y >= y ; Y-- ){
                    if(map[Y] == undefined) break
                    for ( let X = x+map[y][x].vx ; X >= x ; X-- ){
                        if(map[Y][X] == undefined) break
                        if(moved) break
                        if(map[Y][X].type == 'air'){
                            deltaMap[y][x] = new Cell('air')
                            deltaMap[Y][X] = map[y][x]
                            moved = true
                        }
                    }
                }
            }
        }
    }
    renderMap(world)
    return deltaMap
}


function loop(){

//     --loop--

    setTimeout(() => {
        requestAnimationFrame(loop)
    }, 1000 / fps);

//   --updates--

    world = updateMap(world)

//   --rendering--

    c.clearRect( 0, 0, width, height)
    renderMap(world)

}

let world = []
for( let y = 0 ; y < height ; y++ ){
    world.push([])
    for( let x = 0 ; x < width ; x++ ){
        world[y].push( new Cell(rdm(4)?'air':'sand'))
    }
}


world = updateMap(world)








loop()