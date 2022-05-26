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

canvas.width = width
canvas.height = height

c.fillStyle = '#CCC'
c.strokeStyle = '#CCC'
c.font = '10px monospace'

let mouse = {
    x: width/2,
    y: height/2,
    z: false,
    size: 4,
}
canvas.addEventListener( 'mousemove', ( event)=>{
    mouse.x = event.x
    mouse.y = event.y
})
canvas.addEventListener( 'mousedown', ()=>{
    mouse.z = true
})
window.addEventListener( 'mouseup', ()=>{
    mouse.z = false
})


let types = {
    air: {
        hueRange: [ 0, 0 ],
        saturationRange: [ 0, 0 ],
        lightnessRange: [ 0, 0 ],
        alphaRange: [ 0, 0 ],
        denisty: 0,
        behaviour: 'fluid',
        updatable: true,
        maxVelocity: 3,
        flameblity: 0,
        maxAge: 0,
    },
    smoke: {
        hueRange: [ 0, 0 ],
        saturationRange: [ 0, 0 ],
        lightnessRange: [ 75, 90 ],
        alphaRange: [ 100, 100],
        denisty: -1,
        behaviour: 'fluid',
        updatable: true,
        maxVelocity: 3,
        flameblity: 0,
        maxAge: 100,
    },
    sand: {
        hueRange: [ 25, 30 ],
        saturationRange: [ 50, 60 ],
        lightnessRange: [ 45, 50 ],
        alphaRange: [ 90, 100],
        denisty: 2,
        behaviour: 'dust',
        updatable: true,
        maxVelocity: 2,
        flameblity: 0.1,
        maxAge: 0,
    },
    water: {
        hueRange: [ 233, 235 ],
        saturationRange: [ 53, 55 ],
        lightnessRange: [ 50, 50 ],
        alphaRange: [ 100, 100],
        denisty: 1,
        behaviour: 'fluid',
        updatable: true,
        maxVelocity: 3,
        flameblity: 0,
        maxAge: 0,
    },
    oil: {
        hueRange: [ 100, 100 ],
        saturationRange: [ 30, 32 ],
        lightnessRange: [ 6, 7 ],
        alphaRange: [ 100, 100],
        denisty: 1,
        behaviour: 'fluid',
        updatable: true,
        maxVelocity: 3,
        flameblity: 1,
        maxAge: 0,
    },
    stone: {
        hueRange: [ 0, 0 ],
        saturationRange: [ 0, 0 ],
        lightnessRange: [ 30, 40 ],
        alphaRange: [ 100, 100],
        denisty: 5,
        behaviour: 'solid',
        updatable: false,
        maxVelocity: 2,
        flameblity: 0,
        maxAge: 0,
    },
    plastic: {
        hueRange: [ 0, 256 ],
        saturationRange: [ 30, 70 ],
        lightnessRange: [ 30, 40 ],
        alphaRange: [ 100, 100],
        denisty: 5,
        behaviour: 'solid',
        updatable: false,
        maxVelocity: 2,
        flameblity: 0,
        maxAge: 0,
    },
    wood: {
        hueRange: [ 25, 30 ],
        saturationRange: [ 30, 35 ],
        lightnessRange: [ 10, 13 ],
        alphaRange: [ 100, 100],
        denisty: 5,
        behaviour: 'solid',
        updatable: false,
        maxVelocity: 2,
        flameblity: 0.7,
        maxAge: 0,
    },
    fire: {
        hueRange: [ 0, 20 ],
        saturationRange: [ 50, 60 ],
        lightnessRange: [ 40, 50 ],
        alphaRange: [ 100, 100],
        denisty: -1,
        behaviour: 'gas',
        updatable: false,
        maxVelocity: 2,
        flameblity: 0,
        maxAge: 10,
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
        this.maxVelocity = types[this.type].maxVelocity
        this.flameblity = types[this.type].flameblity
        this.style = `hsla(
            ${random(types[this.type].hueRange[0],types[this.type].hueRange[1], 1)},
            ${random(types[this.type].saturationRange[0],types[this.type].saturationRange[1], 1)}%,
            ${random(types[this.type].lightnessRange[0],types[this.type].lightnessRange[1], 1)}%,
            ${random(types[this.type].alphaRange[0],types[this.type].alphaRange[1], 1)}%)`
        this.updatable = types[this.type].updatable
        this.updated = false
        this.age = 0
        this.maxAge = types[this.type].maxAge
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

    for( let y in map ){
        for( let x in map[y] ){
            map[y][x].updated = false
            map[y][x].age++
            if( map[y][x].age >= map[y][x].maxAge & map[y][x].maxAge != 0 ) map[y][x] = new Cell('air')
        }
    }

    let deltaMap = []  
    for ( let y in map ){
        deltaMap.push([])
        for ( let x in map[y] ){
            deltaMap[y].push(map[y][x])
        }
    }

    for ( let y = 0 ; y < map.length ; y++ ){       //determining the velocity based on the possision
        for ( let x = 0 ; x < map[0].length ; x++ ){
        switch (map[y][x].behaviour) {
            case 'dust':
                if( map[y][x].vy > 0 ){
                    if(map[y][x].vy < map[y][x].maxVelocity )  map[y][x].vy += -1
                } else if ( map[y][x].vy < 0 ){
                    if(map[y][x].vy < map[y][x].maxVelocity )  map[y][x].vy += -1
                }
                if( map[y][x].vx > 0 ){
                    if(map[y][x].vx < map[y][x].maxVelocity )  map[y][x].vx += -1
                } else if ( map[y][x].vx < 0 ){
                    if(map[y][x].vx < map[y][x].maxVelocity )  map[y][x].vx += 1
                }
                if(map[y+1] != undefined ){
                    if( map[y+1][x].denisty < map[y][x].denisty ){
                        if(map[y][x].vy < map[y][x].maxVelocity )  map[y][x].vy += 1
                    }
                     if( map[y+1][x+1] != undefined) {
                        if(map[y+1][x+1].denisty < map[y][x].denisty){
                            if(map[y][x].vy < map[y][x].maxVelocity )  map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity )  map[y][x].vx += 1
                        }
                    }
                    if( map[y+1][x-1] != undefined ){
                        if(map[y+1][x-1].denisty < map[y][x].denisty){
                            if(map[y][x].vy < map[y][x].maxVelocity )  map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity )  map[y][x].vx += -1
                        }
                    }
                } 
                break;
            case 'fluid':
                moved = false

                if( map[y][x].vy < -2 ) map[y][x].vy++
                if( map[y][x].vx < -2 ) map[y][x].vx++
                if( map[y][x].vy > +2 ) map[y][x].vy--
                if( map[y][x].vx > +2 ) map[y][x].vx--

                if(map[y+1] != undefined ){
                    if( map[y+1][x].denisty < map[y][x].denisty ){
                        map[y][x].vy = 1
                        moved = true
                    }
                    if( map[y+1][x+1] != undefined ){
                        if(map[y+1][x+1].denisty < map[y][x].denisty ){
                            if(map[y][x].vy < map[y][x].maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += 1
                            moved = true
                        }
                    }
                    if( map[y+1][x-1] != undefined ){
                        if(map[y+1][x-1].denisty < map[y][x].denisty ){
                            if(map[y][x].vy < map[y][x].maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += -1
                            moved = true
                        }
                    }
                }
                if( map[y][x+1] != undefined ){
                    if(map[y][x+1].denisty < map[y][x].denisty & !moved & rdm(1) ){
                        if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += 1
                        moved = true
                    }
                }
                if( map[y][x-1] != undefined ){
                    if(map[y][x-1].denisty < map[y][x].denisty & !moved ){
                        if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += -1
                        moved = true
                    }
                }                
                break;
            case 'gas':
                moved = false
/*
                if( map[y][x].vy < -2 ) map[y][x].vy++
                if( map[y][x].vx < -2 ) map[y][x].vx++
                if( map[y][x].vy > +2 ) map[y][x].vy--
                if( map[y][x].vx > +2 ) map[y][x].vx--
*/
                map[y][x].vy = 1

                if(map[y+1] != undefined ){
                    if( map[y+1][x].denisty > map[y][x].denisty ){
                        map[y][x].vy = 1
                        moved = true
                    }
                    if( map[y+1][x+1] != undefined ){
                        if(map[y+1][x+1].denisty > map[y][x].denisty ){
                            if(map[y][x].vy < map[y][x].maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += 1
                            moved = true
                        }
                    }
                    if( map[y+1][x-1] != undefined ){
                        if(map[y+1][x-1].denisty > map[y][x].denisty ){
                            if(map[y][x].vy < map[y][x].maxVelocity ) map[y][x].vy += 1
                            if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += -1
                            moved = true
                        }
                    }
                }
                if( map[y][x+1] != undefined ){
                    if(map[y][x+1].denisty > map[y][x].denisty & !moved & rdm(1) ){
                        if(map[y][x].vx < map[y][x].maxVelocity ) map[y][x].vx += 1
                        moved = true
                    }
                }
            default:
                break;
            }
            if ( map[y][x].type == 'fire' ){
                if(map[y][x].strength <= 0 ){
                    deltaMap[y][x] = new Cell('air')
                }
                deltaMap[y][x].strength += -1 
                for( let fy = -1 ; fy <= 1 ; fy++){
                    if(map[y+fy] == undefined ) continue
                    for( let fx = -1 ; fx <= 1 ; fx++){
                        if( fy == 0 & fx == 0 ) continue
                        if(map[y+fy][x+fx] == undefined ) continue
                        if(rdm(map[y+fy][x+fx].flameblity)){
                            deltaMap[y][x].strength += -1 
                            if(rdm(20)) deltaMap[y+fy][x+fx] = new Cell('fire')
                            else deltaMap[y+fy][x+fx] = new Cell('smoke')
                        }
                    }
                }
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
    mouse.style = `hsl(${average(types[tool].hueRange)}, ${average(types[tool].saturationRange)}%, ${average(types[tool].lightnessRange)}%)`;
    if(mouse.z){
        for( let i = 0 ; i < mouse.size ; i++ ){
            for( let a = 0 ; a < mouse.size ; a++ ){
                if(currentMap[Math.floor(mouse.y/res)+i] == undefined ) continue
                if(currentMap[Math.floor(mouse.y/res)+i][Math.floor(mouse.x/res)+a] == undefined ) continue
                currentMap[Math.floor(mouse.y/res)+i][Math.floor(mouse.x/res)+a] = new Cell(tool)
            }
        }
    }

//   --rendering--

    c.clearRect( 0, 0, width, height)
    renderMap(currentMap)
    c.fillStyle = mouse.style;
    c.fillRect( Math.floor(mouse.x/res)*res, Math.floor(mouse.y/res)*res, mouse.size*res, mouse.size*res)
}

let world = []
for( let y = 0 ; y < Math.round(height/res) ; y++ ){
    world.push([])
    for( let x = 0 ; x < Math.round(width/res) ; x++ ){
        //world[y].push( new Cell(typesList[rdm(3)]))
        //if(rdm(1)) world[y][x] = new Cell('air')
        world[y].push( new Cell(rdm(2)?'wood':'air'))
        if( y == 45 ) world[y][x] = new Cell('fire')
        //if( y == 46 ) world[y][x] = new Cell('stone')
    }
}

let tool = 'sand'
for( let i in types ){
    $('materials').innerHTML += `<div class="selection" id="${i}-selector">${i}</div>`
    $(i+'-selector').style.background = `hsl(${average(types[i].hueRange)}, ${average(types[i].saturationRange)}%, ${average(types[i].lightnessRange)}%)`   
}
for( let i in types ){
    $(i+'-selector').addEventListener('click', ()=>{
        tool = i
    })
}


let currentMap = world;
loop()

