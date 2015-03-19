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

    GameState.POLYGON_SIMPLE = [
       100, 100,
       700, 100,
       700, 500,
       100, 500,

    ]

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
    }

    p.drawPolygon = function(poly) {
        this.bitmap.context.beginPath();
        this.bitmap.context.moveTo(
            poly.points[poly.points.length-1].x, 
            poly.points[poly.points.length-1].y);

        for (var i=0; i < poly.points.length; i++) {
            this.bitmap.context.lineTo(poly.points[i].x, poly.points[i].y);
        }
        this.bitmap.context.stroke();     
    }

    // @phaser
    p.update = function() {
        // console.log("update");
        this.drawBitmapData();
    };

    // @phaser
    p.render = function() {
        // console.log("render");
        
    };

window.GameState=GameState
}());

var game = new Phaser.Game(800, 600, Phaser.AUTO, "main");
game.state.add("main", GameState, true);


