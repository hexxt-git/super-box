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
function average( values ){
    return Math.floor(( values[0] + values[1] ) / 2)
}
function countCells(){
    let count = {}
    for ( let i in types ){
        count[i] = 0
    }
    for ( let y of world ){
        for ( let x of y ){
            count[x.type] += 1
        }
    }
    return count
}

let canvas = $('canvas')
let c = canvas.getContext('2d')
let width = $('container').clientWidth
let height = $('container').clientHeight
let stepsPerSecond = 60
let res = 8
let paused = false
let maxVelocity = 4

canvas.width = width
canvas.height = height

c.fillStyle = '#CCC'
c.strokeStyle = '#CCC'
c.font = '15px monospace'

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
        hueRange: [ 25, 30 ],
        saturationRange: [ 50, 60 ],
        lightnessRange: [ 45, 50 ],
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
        this.updated = false
    }
}

let renderMap = (map)=>{
    for ( let y in map ){
        for ( let x in map[y] ){
            c.fillStyle = map[y][x].style
            c.fillRect( x*res ,y*res , res, res)
            c.fillStyle = 'black'
            //c.fillText( `${x}, ${y}`, x*res+res/3, y*res+res/2)
        }
    }
}

let updateMap = (map)=>{

    let deltaMap = []  
    for ( let y in map ){
        deltaMap.push([])
        for ( let x in map[y] ){
            map[y][x].updated = false
            deltaMap[y].push(map[y][x])
        }
    }

    for ( let y = 0 ; y < map.length ; y++ ){       //determining the velocity based on the possision
        for ( let x = 0 ; x < map[0].length ; x++ ){
        switch (map[y][x].behaviour) {
            case 'dust':
                if( map[y][x].vy > 0 ){
                    if(map[y][x].vy < maxVelocity ) map[y][x].vy += -1
                } else if ( map[y][x].vy < 0 ){
                    if(map[y][x].vy < maxVelocity ) map[y][x].vy += -1
                }
                if( map[y][x].vx > 0 ){
                    if(map[y][x].vx < maxVelocity ) map[y][x].vx += -1
                } else if ( map[y][x].vx < 0 ){
                    if(map[y][x].vx < maxVelocity ) map[y][x].vx += 1
                }
                if(map[y+1] != undefined ){
                    if( map[y+1][x].denisty < map[y][x].denisty ){
                        if(map[y][x].vy < maxVelocity ) map[y][x].vy += 1
                    }
                     if( map[y+1][x+1] != undefined) {
                        if(map[y+1][x+1].denisty < map[y][x].denisty){
                            if(map[y][x].vy < maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < maxVelocity ) map[y][x].vx += 1
                        }
                    }
                    if( map[y+1][x-1] != undefined ){
                        if(map[y+1][x-1].denisty < map[y][x].denisty){
                            if(map[y][x].vy < maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < maxVelocity ) map[y][x].vx += -1
                        }
                    }
                } 
                break;
            case 'fluid':
                let moved = false
                if(map[y+1] != undefined ){
                    if( map[y+1][x].denisty < map[y][x].denisty ){
                        map[y][x].vy = 1
                        moved = true
                    }
                    if( map[y+1][x+1] != undefined ){
                        if(map[y+1][x+1].denisty < map[y][x].denisty ){
                            if(map[y][x].vy < maxVelocity )map[y][x].vy += 1
                            if(map[y][x].vx < maxVelocity )map[y][x].vx += 1
                            moved = true
                        }
                    }
                    if( map[y+1][x-1] != undefined ){
                        if(map[y+1][x-1].denisty < map[y][x].denisty ){
                            if(map[y][x].vy < maxVelocity )map[y][x].vy += 1
                            if(map[y][x].vx < maxVelocity )map[y][x].vx += -1
                            moved = true
                        }
                    }
                }
                if( map[y][x+1] != undefined ){
                    if(map[y][x+1].denisty < map[y][x].denisty & !moved & rdm(1) ){
                        if(map[y][x].vx < maxVelocity )map[y][x].vx += 1
                        moved = true
                    }
                }
                if( map[y][x-1] != undefined ){
                    if(map[y][x-1].denisty < map[y][x].denisty & !moved ){
                        if(map[y][x].vx < maxVelocity )map[y][x].vx += -1
                        moved = true
                    }
                }                
                break;
            default:
                break;
            }
        }
    }

    for ( let y = 0 ; y < map.length ; y++ ){       //moving based on the velocity
        for ( let x = 0 ; x < map[0].length ; x++ ){
            if (!map[y][x].updatable) continue
            let moved = false
            let dy = map[y][x].vy
            dy += dy > 0 ? 1 : -1;

            while ( dy != 0 ) {
                dy += dy > 0 ? -1 : 1;
                let dx = map[y][x].vx
                dx += dx > 0 ? 1 : -1;
                if(moved) continue

                while ( dx != 0 ) {
                    dx += dx > 0 ? -1 : 1;

                    if( map[y+dy] == undefined ) continue
                    if(map[y+dy][x+dx] == undefined) continue
                    if( dy == 0 & dx == 0 ) continue
                    if(moved) continue
                    if(deltaMap[y][x].updated) continue
                    if(deltaMap[y+dy][x+dx].updated) continue
                    
                    if(map[y+dy][x+dx].denisty < map[y][x].denisty == true){
                        deltaMap[y][x] = map[y+dy][x+dx]
                        deltaMap[y+dy][x+dx] = map[y][x]
                        deltaMap[y][x].updated = true
                        deltaMap[y+dy][x+dx].updated = true
                        moved = true
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
    }, 1000 / stepsPerSecond);
    step++

//   --updates--

    currentMap = updateMap(currentMap)
    cursor.x = mouse.x
    cursor.y = mouse.y 
    cursor.style = `hsl(${average(types[tool].hueRange)}, ${average(types[tool].saturationRange)}%, ${average(types[tool].lightnessRange)}%)`;
    if(mouse.z){
        currentMap[Math.floor(cursor.y/res)][Math.floor(cursor.x/res)] = new Cell(tool)
    }

//   --rendering--

    c.clearRect( 0, 0, width, height)
    renderMap(currentMap)
    c.fillStyle = cursor.style;
    c.fillRect( Math.floor(cursor.x/res)*res, Math.floor(cursor.y/res)*res, res, res)
}

let world = []
for( let y = 0 ; y < Math.round(height/res) ; y++ ){
    world.push([])
    for( let x = 0 ; x < Math.round(width/res) ; x++ ){
        world[y].push( new Cell(typesList[rdm(2)]))
    }
}

let tool = 'water'
for( let i in types ){
    $('materials').innerHTML += `<div class="selection" id="${i}-selector">${i}</div>`
    $(i+'-selector').style.background = `hsl(${average(types[i].hueRange)}, ${average(types[i].saturationRange)}%, ${average(types[i].lightnessRange)}%)`   
}
for( let i in types ){
    $(i+'-selector').addEventListener('click', ()=>{
        tool = i
    })
}

let cursor = {
    x: width/2,
    y: height/2,
    style: `white`,
}

let currentMap = world;
loop()