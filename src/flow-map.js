function FlowMap(w, h, cellSize) {
  this.w = w;
  this.h = h;
  this.cellSize = cellSize;
  this.cells = [];
  this.goals = [];
  
  for(var x=0; x<this.w; x++) {
    this.cells[x] = [];
    for(var y=0; y<this.h; y++) {
      if(x === 0 || x === w-1 || y === 0 || y === h-1) this.cells[x][y] = FlowMap.IMPASSABLE;
      else if (Math.random() < 0.45) this.cells[x][y] = FlowMap.IMPASSABLE;
      else this.cells[x][y] = FlowMap.PASSABLE;
    }
  }
}

FlowMap.PASSABLE = -1;
FlowMap.IMPASSABLE = -2;
FlowMap.GOAL = 0;
FlowMap.directions = [
  [ 0, -1], // N
  [ 1, -1], // NE
  [ 1,  0], // E
  [ 1,  1], // SE
  [ 0,  1], // S
  [-1,  1], // SW
  [-1,  0], // W
  [-1, -1]  // NW
];

FlowMap.prototype.setGoal = function (x, y) {
  var cell = this.getCell(x, y);
  if(typeof cell === 'number' && cell !== FlowMap.IMPASSABLE) {
    this.cells[x][y] = FlowMap.GOAL;
  }
  this.goals.push([x,y]);
};

FlowMap.prototype.reset = function () {
  for(var x=0; x<this.w; x++) {
    for(var y=0; y<this.h; y++) {
      if(this.cells[x][y] !== FlowMap.IMPASSABLE) this.cells[x][y] = FlowMap.PASSABLE; 
    }
  }
  this.goals.splice(0, -1);
};

FlowMap.prototype.getCell = function (x, y) {
  if(x<0 || x>this.w-1 || y<0 || y>this.h-1) return false;
  return this.cells[x][y];
};

FlowMap.prototype.setCell = function (x, y, value) {
  if(x<0 || x>this.w-1 || y<0 || y>this.h-1) return false;
  return this.cells[x][y] = value;
};

FlowMap.prototype.forEachNeighbor = function (x, y, callback, cardinal) {
  var cell, direction;
  if(typeof callback === 'function') {
    for(var i=0; i<FlowMap.directions.length; i++) {
      direction = FlowMap.directions[i];
      // Cardinal directions only, please.
      if(cardinal && direction[0]!== 0 && FlowMap.directions[i][1]!== 0) continue;
      
      cell = this.getCell(x + direction[0], y + direction[1]);
      if(typeof cell === 'number' && cell !== FlowMap.IMPASSABLE) callback(x, y, cell, x + direction[0], y + direction[1]);
    }
  }
};

FlowMap.prototype.getLowest = function(x, y) {
    var lowestValue = this.getCell(x, y), lowestCell = {x: 0, y: 0};
    function processCell (x, y, neighbor, nx, ny) {
        if(neighbor<=lowestValue) {
            lowestValue = neighbor;
            lowestCell.x = nx;
            lowestCell.y = ny;
        }
    }
    this.forEachNeighbor(x, y, processCell);
    return lowestCell;
};

FlowMap.prototype.update = function (iterations) {
  var visited = {},
      visiting,
      next = this.goals.slice(0), 
      self = this, 
      n = 0, 
      pos,
      i;

  function __queueNeighbor(oldX, oldY, cell, newX, newY) {
    if(visited[newX+'_'+newY]) {
      return;
    }
    if(visiting[newX+'_'+newY]) {
      return;
    }
    if(self.getCell(newX, newY) === FlowMap.IMPASSABLE) {
      return;
    }

    n++;
    next[newX+'_'+newY] = [newX, newY];

  }

  for(i=0; i<iterations; i++) {
    visiting = next;
    next = {};

    for(var v in visiting) {
      pos = visiting[v];

      visited[pos[0]+'_'+pos[1]] = true;
      this.cells[pos[0]][pos[1]] = i;
      
      this.forEachNeighbor(pos[0], pos[1], __queueNeighbor);
    }
  }

  console.log('crawled over ', n, ' cells.');
};