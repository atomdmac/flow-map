Renderer = function (map) {
  this.map = map;
};

Renderer.prototype.pxToCell = function (x, y) {
  return {
    x: Math.floor(x/this.map.cellSize),
    y: Math.floor(y/this.map.cellSize)
  };
};

Renderer.prototype.draw = function (ctx, map) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  map = map || this.map;
  
  for(var x=0; x<map.w; x++) {
    for(var y=0; y<map.h; y++) {
      this.drawCell(x, y, map);
    }
  }
};

Renderer.prototype.drawCell = function (x, y, map) {
  map = map || this.map;
  var cell = map.cells[x][y];

  // Impassable cells.
  if(cell === FlowMap.GOAL) {
    ctx.fillStyle = "#000";
  }

  // Goal cells.
  else if(cell === FlowMap.IMPASSABLE) {
    ctx.fillStyle = "#cfcfcf";
  }

  else if(cell === FlowMap.PASSABLE) {
    ctx.fillStyle = "#ffffff";
  }

  // Floor cells.
  else {
    // ctx.fillStyle = '#ccc';
    ctx.fillStyle = this.getColor(cell, map.w*2);
    //cell += Math.round(cell * .15);
    //ctx.fillStyle = 'rgb(' + cell + ',' +  cell + ',' + cell + ')';
  }
  ctx.beginPath();
  ctx.rect(x*map.cellSize, y*map.cellSize, map.cellSize, map.cellSize);
  ctx.fill();
  ctx.fillStyle = "#000";
  // ctx.fillText(map.cells[x][y], x*map.cellSize+map.cellSize/2, y*map.cellSize+map.cellSize/2);
};

Renderer.prototype.getColor = function (integer, max) {
  var output = Math.floor((integer/max) * 360);
  return 'hsl(' + output + ', 100%, 50%)';
};