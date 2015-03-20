/**
 * Phaser 2D Navmesh Example
 * 
 * Copyright (c) Chong-U Lim
 * http://github.com/chongdashu
 */


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


    p.initialize = function(game) {

    };

    // @phaser
    p.create = function() {
        this.createBitmapContext();
        this.createPolygon();
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

        if (this.triPolies.length == 0) {
          if (this.triangles.length > 0 ) {
            var triangles = this.triangles.slice();
            while (triangles.length > 0) {
              var threePts = triangles.splice(0,3);
              var flatPts = [];
              for (var i=0; i < threePts.length; i++) {
                flatPts = flatPts.concat(threePts[i]);
              }
              
              var tri = new Phaser.Polygon(flatPts);
              tri.strokeStyle = "rgb(" + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + ")";
              tri.fillStyle = "rgb(" + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + "," + this.game.rnd.pick([255,0]) + ")";
              this.triPolies.push(tri);
              
            }
          }
        }

        for (var i = this.triPolies.length - 1; i >= 0; i--) {
          this.drawPolygon(this.triPolies[i]);  
        };
          
        
        
    }

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
    };

    p.updateInput = function() {
        var clientX = this.game.input.mousePointer.clientX;
        var clientY = this.game.input.mousePointer.clientY;
        if (!this.mouseDown && this.game.input.mousePointer.isDown) {
            console.log("down, (%s, %s)", clientX, clientY);
            this.mouseDown = true;

            // var points = this.polygon.points;
            // points.push(new Phaser.Point(clientX, clientY));
            // points = this.convexHull(points);
            // this.polygon = new Phaser.Polygon(points);
            // console.log(this.polygon.points.length);

            this.cutPolygon(this.polygon);

        }
        else if (this.mouseDown && !this.game.input.mousePointer.isDown) {
            this.mouseDown = false;
        }


    };

    p.convexHull = function(points) {
        points.sort(function(a, b) {
          return a.x == b.x ? a.y - b.y : a.x - b.y;
        });
     
       var lower = [];
       for (var i = 0; i < points.length; i++) {
          while (lower.length >= 2 && this.crossMult(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
             lower.pop();
          }
          lower.push(points[i]);
       }
     
       var upper = [];
       for (var i = points.length - 1; i >= 0; i--) {
          while (upper.length >= 2 && this.crossMult(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
             upper.pop();
          }
          upper.push(points[i]);
       }
     
       upper.pop();
       lower.pop();
       return lower.concat(upper);
    };

    p.crossMult = function(o, a, b) {
       return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
    };

    // @phaser
    p.render = function() {
        // console.log("render");
        
    };

window.GameState=GameState
}());

var game = new Phaser.Game(800, 600, Phaser.AUTO, "main");
game.state.add("main", GameState, true);


