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
};
function pause (){
    paused = true
};
function play (){
    paused = false
    loop()
};
function countCells(){
    let count = {}
    for ( let y of world ){
        for ( let x of y ){
            if( count[x.type] == undefined ) count[x.type] = 1
            count[x.type]+=1
        }
    }
    return count
}

let canvas = $('canvas')
let c = canvas.getContext('2d')
let width = $('container').clientWidth
let height = $('container').clientHeight
let fps = 100
let res = 5
let paused = false

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
        hueRange: [ 0, 0 ],
        saturationRange: [ 0, 0 ],
        lightnessRange: [ 0, 0 ],
        alphaRange: [ 0, 0 ],
        denisty: 0,
        behaviour: 'air',
        updatable: false,
    },
    sand: {
        hueRange: [ 20, 35 ],
        saturationRange: [ 50, 60 ],
        lightnessRange: [ 40, 60 ],
        alphaRange: [ 90, 100],
        denisty: 2,
        behaviour: 'dust',
        updatable: true,
    },
    water: {
        hueRange: [ 230, 240 ],
        saturationRange: [ 50, 55 ],
        lightnessRange: [ 35, 40 ],
        alphaRange: [ 100, 100],
        denisty: 1,
        behaviour: 'fluid',
        updatable: true,
    },
    stone: {
        hueRange: [ 0, 0 ],
        saturationRange: [ 0, 0 ],
        lightnessRange: [ 30, 40 ],
        alphaRange: [ 100, 100],
        denisty: 5,
        behaviour: 'solid',
        updatable: true,
    },
}
let typesList = []
for ( let i in types) typesList.push(i)

class Cell{
    constructor(type){
        this.type = type
        this.vx = 0
        this.vy = 0
        this.denisty = types[this.type].denisty
        this.behaviour = types[this.type].behaviour
        this.style = `hsla(
            ${random(types[this.type].hueRange[0],types[this.type].hueRange[1], 1)},
            ${random(types[this.type].saturationRange[0],types[this.type].saturationRange[1], 1)}%,
            ${random(types[this.type].lightnessRange[0],types[this.type].lightnessRange[1], 1)}%,
            ${random(types[this.type].alphaRange[0],types[this.type].alphaRange[1], 1)}%)`
        this.updatable = types[this.type].updatable
    }
}

let renderMap = (map)=>{
    for ( let y in map ){
        for ( let x in map[y] ){
            c.fillStyle = map[y][x].style
            c.fillRect( x*res ,y*res , res, res)
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
    
    for ( let y = 0 ; y < map.length ; y++ ){
        for ( let x = 0 ; x < map[y].length ; x++ ){
            map[y][x].vy = 1
            if( !map[y][x].updatable ) continue
            switch (map[y][x].behaviour) {
                case 'dust':{
                    break;
                };
                case 'fluid':{
                    break;
                };
                default:{
                    break
                };
            }
        }
    }
    
    for ( let y = 0 ; y < map.length ; y++ ){
        for ( let x = 0 ; x < map[0].length ; x++ ){
            if( !map[y][x].updatable ) continue
            let moved = false;
            let dy = map[y][x].vy>0?map[y][x].vy+1:map[y][x].vy-1;
            while( dy != 0 ){
            dy>0?dy--:dy++
            if(map[y+dy]==undefined) continue
                let dx = map[y][x].vx>0?map[y][x].vx+1:map[y][x].vx-1;
                while( dx != 0 ){
                dx>0?dx--:dx++
                if(moved) continue
                    if( map[y+dy][x+dx] == undefined ) continue 
                    if( dy == 0 & dx == 0 ) continue
                    if( map[y+dy][x+dx].denisty < map[y][x].denisty ){
                        deltaMap[y][x] = map[dy+y][dx+x]
                        deltaMap[y+dy][x+dx] = map[y][x]
                        moved = false
                    }
                }
            }
        }
    }
    
    return deltaMap
}

let step = 0

function loop(){

//     --loop--

    setTimeout(() => {
        if ( !paused ){
        requestAnimationFrame(loop)
        }
    }, 1000 / fps);
    step++

//   --updates--

    //if(step%3==0) world[5][random( 5, 20, true)]= new Cell(typesList[rdm(typesList.length-1)])
    world = updateMap(world)

//   --rendering--

    c.clearRect( 0, 0, width, height)
    renderMap(world)

}

let world = []
for( let y = 0 ; y < height/res ; y++ ){
    world.push([])
    for( let x = 0 ; x < width/res ; x++ ){
        world[y].push( new Cell(typesList[rdm(typesList.length-1)]))
        //world[y].push( new Cell('air'))
    }
}


world[5][15]=new Cell('sand')
renderMap (world)
world = updateMap(world)
c.clearRect( 0, 0, width, height)
renderMap (world)








loop()