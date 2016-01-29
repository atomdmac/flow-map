function randomInt (min, max) {
  return Math.round((Math.random() * (max-min)) + min);
}

function getColor(integer, max) {
  var output = Math.floor((integer/max) * 360);
  return 'hsl(' + output + ', 100%, 50%)';
}

function Map(w, h, cellSize) {
  this.w = w;
  this.h = h;
  this.cellSize = cellSize;
  this.cells = [];
  
  for(var x=0; x<this.w; x++) {
    this.cells[x] = [];
    for(var y=0; y<this.h; y++) {
      if(x === 0 || x === w-1 || y === 0 || y === h-1) this.cells[x][y] = Map.IMPASSABLE;
      else if (Math.random() < 0.25) this.cells[x][y] = Map.IMPASSABLE;
      else this.cells[x][y] = Map.PASSABLE;
    }
  }
}

Map.PASSABLE = 999;
Map.IMPASSABLE = -1;
Map.GOAL = 0;
Map.directions = [
  [ 0, -1], // N
  [ 1, -1], // NE
  [ 1,  0], // E
  [ 1,  1], // SE
  [ 0,  1], // S
  [-1,  1], // SW
  [-1,  0], // W
  [-1, -1]  // NW
];

Map.prototype.setGoal = function (x, y) {
  var cell = this.getCell(x, y);
  if(typeof cell === 'number' && cell !== Map.IMPASSABLE) {
    this.cells[x][y] = Map.GOAL;
  }
}

Map.prototype.reset = function () {
  for(var x=0; x<this.w; x++) {
    for(var y=0; y<this.h; y++) {
      if(this.cells[x][y] !== Map.IMPASSABLE) this.cells[x][y] = Map.PASSABLE; 
    }
  }
}

Map.prototype.draw = function (ctx) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for(var x=0; x<this.w; x++) {
    for(var y=0; y<this.h; y++) {
      this.drawCell(x, y);
    }
  }
}

Map.prototype.drawCell = function (x, y) {
  var cell = this.cells[x][y];

  // Impassable cells.
  if(cell === Map.GOAL) {
    ctx.fillStyle = "#0f0f0f"
  }

  // Goal cells.
  else if(cell === Map.IMPASSABLE) {
    ctx.fillStyle = "#cfcfcf";
  }

  // Floor cells.
  else {
    // ctx.fillStyle = '#ccc';
    ctx.fillStyle = getColor(cell, this.w*2);
    //cell += Math.round(cell * .15);
    //ctx.fillStyle = 'rgb(' + cell + ',' +  cell + ',' + cell + ')';
  }
  ctx.beginPath();
  ctx.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
  ctx.fill();
  ctx.fillStyle = "#000";
  // ctx.fillText(this.cells[x][y], x*this.cellSize+this.cellSize/2, y*this.cellSize+this.cellSize/2);
}

Map.prototype.pxToCell = function (x, y) {
  return {
    x: Math.floor(x/this.cellSize),
    y: Math.floor(y/this.cellSize)
  }
}

Map.prototype.getCell = function (x, y) {
  if(x<0 || x>this.w-1 || y<0 || y>this.h-1) return false;
  return this.cells[x][y];
}

Map.prototype.getNeighbors = function (x, y, callback, cardinal) {
  var cell, direction;
  if(typeof callback === 'function') {
    for(var i=0; i<Map.directions.length; i++) {
      direction = Map.directions[i];
      // Cardinal directions only, please.
      if(cardinal && direction[0]!== 0 && Map.directions[i][1]!== 0) continue;
      
      cell = this.getCell(x + direction[0], y + direction[1]);
      if(typeof cell === 'number' && cell !== -1) callback(x, y, cell, x + direction[0], y + direction[1]);
    }
  }
};

Map.prototype.getLowest = function(x, y) {
  var lowestValue = this.getCell(x, y), lowestCell = {x: 0, y: 0};
  function processCell (x, y, neighbor, nx, ny) {
    if(neighbor<=lowestValue) {
      lowestValue = neighbor;
      lowestCell.x = nx;
      lowestCell.y = ny;
    }
  }
  this.getNeighbors(x, y, processCell);
  return lowestCell;
}

var updateCount = 0, itrCount = 0;
Map.prototype.makeFlowMap = function () {
  var cell, lowest, lowestDefault = this.w*this.h, changed = false;
  function processCell (x, y, neighbor) {
    if(neighbor<lowest) lowest = neighbor;
  }
  for(var x=0; x<this.w; x++) {
    for(var y=0; y<this.h; y++) {
      lowest = lowestDefault;
      this.getNeighbors(x, y, processCell, true);
      cell = this.getCell(x, y);
      if(cell && cell >= lowest+2) {
        this.cells[x][y] = lowest+1;
        changed = true;
        updateCount++;
      }
    }
  }
  itrCount++;
  if(changed) this.makeFlowMap();
};

function Agent (x, y, map) {
  this.x = x || 1;
  this.y = y || 1;
  this.map = map;
  this.active = true;
}

Agent.prototype.update = function () {
  if(this.map.getCell(this.x, this.y) === Map.GOAL) {
    this.active = false;
    return;
  }
  var nextCell = this.map.getLowest(this.x, this.y);
  this.x = nextCell.x;
  this.y = nextCell.y;
}

Agent.prototype.draw = function (ctx) {
  ctx.beginPath();
  ctx.fillStyle = "#0ff";
  ctx.rect(this.x*this.map.cellSize, this.y*this.map.cellSize, this.map.cellSize, this.map.cellSize);
  ctx.strokeStyle = "#000";
  ctx.stroke();
  ctx.fill();
}

var Simulation = {
  interval: null,
  agents: [],
  start: function () {
    var self = this;
    this.interval = setInterval(function () { self.update() }, 50);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  reset: function () {
    this.agents = [];
  },
  update: function () {
    var agent;
    m.draw(ctx);
    for(var i=0; i<this.agents.length; i++) {
      agent = this.agents[i];
      if(!agent.active) continue;
      agent.update();
      agent.draw(ctx);
      //if(!agent.active) this.agents.splice(i, 1);
      //i--;
    }
  },
  addAgent: function (x, y, map) {
    var agent = new Agent(x, y, map);
    agent.draw(ctx);
    this.agents.push(agent);
  }
}

// Test drawing map.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');
var resetBtn = document.getElementById('reset-btn');

var m = new Map(50, 50, 10, 10);

canvas.addEventListener('mousedown', function (e) {
  var cell = m.pxToCell(e.offsetX, e.offsetY);
  if(m.getCell(cell.x, cell.y) === Map.IMPASSABLE) return;
  Simulation.addAgent(cell.x, cell.y, m);
})

resetBtn.addEventListener('click', function () {
  Simulation.stop();
  Simulation.reset();
  
  updateCount = 0;
  itrCount = 0;
  var startTime = new Date(), endTime;
  m.reset();
  
  var goal, numOfGoals = 1;
  for(var i=0; i<numOfGoals; i++) {
    goal = {
      x: randomInt(0, m.w-1),
      y: randomInt(0, m.h-1)
    }
    m.setGoal(goal.x, goal.y);
  }
  
  m.makeFlowMap();
  m.draw(ctx);
  console.log('Refeshed and searched ', updateCount, ' cells over ', itrCount, ' iterations in ', Number(new Date() - startTime), 'ms');
  
  Simulation.start();
});