/**
 * Phaser 2D Navmesh Example
 * 
 * Copyright (c) Chong-U Lim
 * http://github.com/chongdashu
 */

 (function() {
    "use strict";

var Set = function() {
  this.initialize();
};
var p = Set.prototype;
Set.prototype.constructor = Set;
    
  p.list = null;

  p.initialize = function() {
    this.list = [];
    return this;
  };

  p.add = function(obj) {
    if (!this.contains(obj)) {
      this.list.push(obj);
    }
    return this;
  };

  p.remove = function(obj) {
    if (this.contains(obj)) {
      this.list.splice(this.list.indexOf(obj),1);
    }
  };

  p.contains = function(obj) {
    return this.list.indexOf(obj) >= 0;
  };

  p.isEmpty = function() {
    return this.list.length === 0;
  };

  p.toList = function() {
    return this.list.slice();
  };


window.Set=Set;
}());

(function() {
    "use strict";

var Edge = function(x1, y1, x2, y2) {
  this.initialize(x1, y1, x2, y2);
};
var p = Edge.prototype;
Edge.prototype.constructor = Edge;
    
    p.point1 = null;
    p.point2 = null;

    p.initialize = function(x1, y1, x2, y2) {
      this.x1 = x1 ? x1 : 0;
      this.y1 = y1 ? y1 : 0;
      this.x2 = x2 ? x2 : 0;
      this.y2 = y2 ? y2 : 0;

      if (this.x2 < this.x1) {
        this.x1 = x2;
        this.y1 = y2;
        this.x2 = x1;
        this.y2 = y1;
      }
      else if (this.x2 == this.x1) {
        if (this.y2 < this.y1) {
          this.x1 = x2;
          this.y1 = y2;
          this.x2 = x1;
          this.y2 = y1;
        }
      }

      this.point1 = new Phaser.Point(this.x1,this.y1);
      this.point2 = new Phaser.Point(this.x2,this.y2);
      
    };

    p.equalsToEdge = function(edge) {
      // return (x1==edge.x1 && y1==edge.y1 && x2==edge.x2 && y2==edge.y2) || 
      //        (x1==edge.x2 && y1==edge.y2 && x2==edge.x1 && y2==edge.y1) 

      var truthA = Phaser.Point.equals(this.point1, edge.point1); // && Phaser.Point.equals(this.point2, edge.point2);
      var truthB = Phaser.Point.equals(this.point2, edge.point2); // && Phaser.Point.equals(this.point2, edge.point1);

      return truthA && truthB;
    };

    p.toString = function() {
      return this.point1 + "," + this.point2;
    };

    Edge.test = function() {
      console.log(new Edge(0,0,1,1).equalsToEdge(new Edge(1,1,0,0)));
      console.log(new Edge(0,0,1,1).equalsToEdge(new Edge(0,0,1,1)));
      console.log(new Edge(1,0,0,1).equalsToEdge(new Edge(0,1,1,0)));
      console.log(new Edge(1,0,0,1).equalsToEdge(new Edge(0,1,1,0)));
      console.log(new Edge(0,0,5,5).equalsToEdge(new Edge(5,5,0,0)));
      console.log(new Edge(0,1,0,5).equalsToEdge(new Edge(0,5,0,1)));
      console.log(new Edge(0,10,0,5).equalsToEdge(new Edge(0,5,0,10)));
    };



window.Edge=Edge;
}());


(function() {
    "use strict";

var GameState = function(game) {
  this.initialize(game);
};
var p = GameState.prototype;
GameState.prototype.constructor = GameState;

    // GameState.POLYGON_SIMPLE = [
    //    100, 500,
    //    200, 500,
    //    200, 350,
    //    300, 350,
    //    300, 500,
    //    400, 500,
    //    400, 100,
    //    300, 100,
    //    300, 250,
    //    200, 250,
    //    200, 100,
    //    100, 100
    // ]

    GameState.POLYGON_SIMPLE = [
       100, 500,
       200, 500,
       200, 350,
       300, 350,
       300, 500,
       400, 500,
       400, 100,
       300, 100,
       300, 250,
       200, 250,
       200, 100,
       100, 100
    ]



    p.mouseDown = false;

    p.triangles = [];

    p.triPolies = [];

    p.triText = null;

    p.player = {};

    // Reference: http://www.gamedev.net/page/resources/_/technical/artificial-intelligence/generating-2d-navmeshes-r3393
    p.triangleIds = {}; // <Polygon, Int>
    p.vertexIds = {};   // <Point, Int>
    p.vertices = []     // 
    p.edgeToTriangles = {} // <Edge, Triangles[]>

    p.initialize = function(game) {

    };

    // @phaser
    p.preload = function() {
        this.game.load.image("panda", "res/panda.png");
    };

    // @phaser
    p.create = function() {
        this.createPhysics();
        this.createBitmapContext();
        this.createPolygon();
        this.createPlayer();
    };

    p.createPhysics = function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      game.world.setBounds(0, 0, 800, 600);
    };

    p.createPlayer = function() {
      this.player = this.game.add.sprite(150, 450, "panda");
      this.player.anchor.set(0.5);
      this.player.scale.set(0.1);
      
      this.game.physics.arcade.enable(this.player);



    };

    p.createBitmapContext = function() {
        this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.strokeStyle = "rgb(255, 255, 255)";
        this.game.add.image(0,0, this.bitmap);
    };

    p.createPolygon = function() {
        console.log("createPolygon()");
        this.polygon = new Phaser.Polygon(GameState.POLYGON_SIMPLE);
    };

    p.drawBitmapData = function(poly){
        this.bitmap.context.clearRect(0,0,this.game.width, this.game.height);
        this.drawPolygon(this.polygon);

        for (var i = 0; i < this.triPolies.length; i++) {
          var poly = this.triPolies[i];
          this.drawPolygon(poly);
        }

    };

    p.drawPolygon = function(poly) {

        if (poly.points.length == 0) {
          return;
        }

        this.bitmap.context.beginPath();
       
        this.bitmap.context.strokeStyle = poly.strokeStyle ? poly.strokeStyle : "rgb(255, 255, 255)";
        this.bitmap.context.fillStyle = poly.fillStyle ? poly.fillStyle : "rgb(255, 255, 255)";
        
        // this.bitmap.context.moveTo(
        //     poly.points[poly.points.length-1].x, 
        //     poly.points[poly.points.length-1].y);

        for (var i=0; i < poly.points.length-1; i++) {
            this.bitmap.context.moveTo(poly.points[i].x, poly.points[i].y);
            this.bitmap.context.lineTo(poly.points[i+1].x, poly.points[i+1].y);
        }
        this.bitmap.context.moveTo(poly.points[poly.points.length-1].x, poly.points[poly.points.length-1].y);
        this.bitmap.context.lineTo(poly.points[0].x, poly.points[0].y);
        this.bitmap.context.fill();
        this.bitmap.context.stroke();  
        this.bitmap.dirty = true;    
    };

    // @phaser
    p.update = function() {
        // console.log("update");
        this.updateInput();
        this.drawBitmapData();
        this.updatePathFinding();
    };

    // Path finding
    // -------------

    p.updatePathFinding = function() {
      if (this.targetPoint) {
        var playerTriangle = this.getTriangleFromPoint(this.player.position);
        var targetTriangle = this.getTriangleFromPoint(this.targetPoint);

        // console.log("playerTriangle=%o", playerTriangle);
        // console.log("targetTriangle=%o", targetTriangle);

        if (playerTriangle && targetTriangle) {
          var path = this.astar(playerTriangle, targetTriangle);
          
          if (path.length > 0){
            var first = path[0];
            var last = path.length - 2 >= 0 ? path[path.length-2] : first;

            // console.log("first:%s, last=%s", first.id, last.id);
            // console.log("last=" + last.id);
            // console.log("last.center.x:%s, last.center.y=%s", last.center.x, last.center.y);
            // console.log("this.player.x:%s, this.player.y=%s", this.player.x, this.player.y);


            if (Phaser.Math.fuzzyEqual(last.center.x, this.player.x, 1) &&
                Phaser.Math.fuzzyEqual(last.center.y, this.player.y, 1)){
                console.log("this.targetPoint=" + this.targetPoint);
                this.targetPoint = null;
                this.player.body.velocity.set(0,0);

            }
          else {
            this.game.physics.arcade.moveToXY(this.player, last.center.x, last.center.y, 50);
          }
            // this.game.physics.arcade.moveToPointer(this.player);
          }

        }

      
      }
    };

    p.getTriangleFromPoint = function(point) {
      for (var i=0; i < this.triPolies.length; i++) {
        var triPoly = this.triPolies[i];
        if (triPoly.contains(point.x, point.y)) {
          return triPoly;
        }
      }
      return null;
    };

    p.astar = function (start, end) {
      
      var closedSet = new Set();
      var openSet = new Set().add(start);
      var from = {};

      var g = {};
      var f = {};

      g[start] = 0;
      f[start] = g[start] + this.h(start, end);

      var iters = 0;

      while (!openSet.isEmpty() && iters < 100) {

        var current = this.getLowestFNode(openSet, f);
        if (current == end) {
          return this.path(from, end);
        }
       

        openSet.remove(current);
        closedSet.add(current);

       
        for (var i = 0; i < current.neighbors.length; i++) {
       
       
          var neighbor = current.neighbors[i];
          if (closedSet.contains(neighbor)) {
            continue;
          }

          var tempG = g[current] + this.cost(current, neighbor);
       
          if (!openSet.contains(neighbor) || tempG < g[neighbor]) {
       
            from[neighbor.id] = current;
            g[neighbor] = tempG;
            f[neighbor] = g[neighbor] + this.h(neighbor, end);
            if (!openSet.contains(neighbor)) {
       
              openSet.add(neighbor);
       
            }
          }
      
        }

        iters++;

      
      }
      
    };

    p.cost = function(a, b) {
      return Phaser.Point.distance(a.center, b.center) * 14;
    };

    p.getLowestFNode = function(set, f) {
      
      var lowestTriangle = null;
      var lowestScore = 1000000;

      var triangles = set.toList();
      for (var i=0; i < triangles.length; i++) {
        var triangle = triangles[i];
        var score = f[triangle];
        if (score < lowestScore) {
          lowestScore = score;
          lowestTriangle = triangle;
        }
      }

      return lowestTriangle;

    };

    p.path = function(came_from,current) {
      var c = current;
      var total_path = [c];
      
      while (came_from[c.id]) {
        c = came_from[c.id];
        total_path.push(c);
      }
    
      return total_path;
    };



    p.h = function(triangle1, triangle2) {
      return Phaser.Point.distance(triangle1.center, triangle2.center);
    };

    // -------------

    p.cutPolygon = function(polygon) {
      var points = [];
      for (var i=0; i < polygon.points.length; i++) {
        points.push([polygon.points[i].x, polygon.points[i].y]);
      }

      this.triangles = earcut([points]);

      if (this.triPolies) {
        this.triPolies = [];
      }
      if (this.triPolies.length === 0) {
          if (this.triangles.length > 0 ) {
            var triangles = this.triangles.slice();
            while (triangles.length > 0) {
              var threePts = triangles.splice(0,3);
              var flatPts = [];
              for (var i=0; i < threePts.length; i++) {
                flatPts = flatPts.concat(threePts[i]);
              }

              var edges = [];
              edges.push(new Edge(threePts[0][0], threePts[0][1], threePts[1][0], threePts[1][1]));
              edges.push(new Edge(threePts[1][0], threePts[1][1], threePts[2][0], threePts[2][1]));
              edges.push(new Edge(threePts[2][0], threePts[2][1], threePts[0][0], threePts[0][1]));

              console.log("edges="+edges);
              
              var tri = new Phaser.Polygon(flatPts);
              tri.strokeStyle = "rgb(" + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + ")";
              tri.fillStyle = "rgb(" + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + ")";
              tri.edges = edges.slice();
              tri.neighbors = [];

              tri.id = "triangle_" + this.triPolies.length;
              this.triangleIds[tri.id] = tri;
              this.triPolies.push(tri);
            }
          }
      }

      console.log("%o", this.triPolies);

      if (this.triText) {
        this.triText.removeAll();
      }
      this.triText = this.game.add.group();
      

      for (var i = 0; i < this.triPolies.length; i++) {
        var poly = this.triPolies[i]
        // this.drawPolygon(poly); 
        var avgX = 0;
        var avgY = 0;

        for (var j = 0; j < poly.points.length; j++) {
          console.log(poly.points[j], poly.points[j+1]);
          avgX += poly.points[j].x
          avgY += poly.points[j].y
        };

        avgX /= poly.points.length;
        avgY /= poly.points.length;

        poly.center = new Phaser.Point(avgX, avgY);

        console.log(avgX, avgY);

        var txt = this.game.add.text(avgX, avgY, "#" + this.triPolies.indexOf(poly), { font: "12px Arial", fill: "#ff0044", align: "center" });
        console.log(txt);
        this.triText.add(txt);
        
      }

      this.edgeToTriangles = {};
      for (var i =0; i < this.triPolies.length; i++) {
        var triPoly = this.triPolies[i]; 
        for (var j=0; j < triPoly.edges.length; j++) {
          var edge = triPoly.edges[j];
          if (!this.edgeToTriangles[edge.toString()]) {
            this.edgeToTriangles[edge.toString()] = [];
          }
          this.edgeToTriangles[edge.toString()].push(triPoly);
        }
      }

      for (var i =0; i < this.triPolies.length; i++) {
        var triPoly = this.triPolies[i]; 
        for (var j=0; j < triPoly.edges.length; j++) {
          var edge = triPoly.edges[j];
          for (var k=0; k < this.edgeToTriangles[edge.toString()].length; k++) {
            var triPoly2 = this.edgeToTriangles[edge.toString()][k];

            if (triPoly !== triPoly2) {
              if (triPoly.neighbors.indexOf(triPoly2) < 0) {
                triPoly.neighbors.push(triPoly2);
              }
              if (triPoly2.neighbors.indexOf(triPoly) < 0) {
                triPoly2.neighbors.push(triPoly);
              }
            }
            

          }
        }
      }
    };



    p.updateInput = function() {
        var clientX = this.game.input.mousePointer.clientX;
        var clientY = this.game.input.mousePointer.clientY;
        if (!this.mouseDown && this.game.input.mousePointer.isDown) {
            console.log("down, (%s, %s)", clientX, clientY);
            this.mouseDown = true;
            this.targetPoint = new Phaser.Point(clientX, clientY);

            var playerTriangle = this.getTriangleFromPoint(this.player.position);
            var targetTriangle = this.getTriangleFromPoint(this.targetPoint);

            console.log("playerTriangle=%o, index=%s", playerTriangle, playerTriangle ? playerTriangle.id : "");
            console.log("targetTriangle=%o, index=%s", targetTriangle, targetTriangle ? targetTriangle.id : "");
        }
        else if (this.mouseDown && !this.game.input.mousePointer.isDown) {
            this.mouseDown = false;
        }

        if (this.game.input.keyboard.downDuration(Phaser.Keyboard.Z, 1)) {
          this.cutPolygon(this.polygon);
        }


    };


    // @phaser
    p.render = function() {
        // console.log("render");
        
    };

window.GameState=GameState;
}());

var game = new Phaser.Game(800, 600, Phaser.AUTO, "main");
game.state.add("main", GameState, true);

var gameState = game.state.getCurrentState();


