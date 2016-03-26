function randomInt (min, max) {
  return Math.round((Math.random() * (max-min)) + min);
}

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
  // ctx.strokeStyle = "#000";
  // ctx.stroke();
  ctx.fill();
};

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
    // r.draw(ctx);
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
};

// Test drawing map.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');
var resetBtn = document.getElementById('reset-btn');

var m = new FlowMap(100, 50, 10, 10);
var r = new Renderer(m);

canvas.addEventListener('mousedown', function (e) {
  var cell = r.pxToCell(e.offsetX, e.offsetY);
  if(m.getCell(cell.x, cell.y) === Map.IMPASSABLE) return;
  Simulation.addAgent(cell.x, cell.y, m);
});


function main () {
  Simulation.stop();
  Simulation.reset();
  
  updateCount = 0;
  itrCount = 0;
  var startTime = new Date(), endTime;
  
  var goal, numOfGoals = 1;
  for(var i=0; i<numOfGoals; i++) {
    goal = {
      x: randomInt(0, m.w-1),
      y: randomInt(0, m.h-1)
    };
    m.setGoal(goal.x, goal.y);
  }
  
  m.update(50);
  r.draw(ctx, m);
  // console.log('Refeshed and searched ', updateCount, ' cells over ', itrCount, ' iterations in ', Number(new Date() - startTime), 'ms');
  
  Simulation.start();
}

resetBtn.addEventListener('click', main);
main();