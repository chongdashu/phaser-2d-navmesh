/**
 * Phaser 2D Navmesh Example
 * 
 * Copyright (c) Chong-U Lim
 * http://github.com/chongdashu
 */

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



window.Edge=Edge
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
    }

    // @phaser
    p.create = function() {
        this.createBitmapContext();
        this.createPolygon();
        this.createPlayer();
    };

    p.createPlayer = function() {
      this.player = this.game.add.sprite(150, 450, "panda");
      this.player.anchor.set(0.5);
      this.player.scale.set(0.1);

    }

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
          var poly = this.triPolies[i]
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
    }

    // @phaser
    p.update = function() {
        // console.log("update");
        this.updateInput();
        this.drawBitmapData();
    };

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

window.GameState=GameState
}());

var game = new Phaser.Game(800, 600, Phaser.AUTO, "main");
game.state.add("main", GameState, true);

var gameState = game.state.getCurrentState();


