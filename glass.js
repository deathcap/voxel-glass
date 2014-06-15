'use strict';

var ItemPile = require('itempile');
var ucfirst = require('ucfirst');

module.exports = function(game, opts) {
  return new GlassPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-use']
};

function GlassPlugin(game, opts) {
  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-glass requires voxel-registry');

  this.use = game.plugins.get('voxel-use');
  if (!this.use) throw new Error('voxel-glass requires voxel-use');

  this.enable();
}

// Get X or Z depending on the player orientation
GlassPlugin.prototype.playerOrientation = function() {
  var heading = Math.atan2(self.game.cameraVector()[0], self.game.cameraVector()[2]);
  var dir;
  if (Math.abs(heading) <= Math.PI / 4) { // 0 +/- 45 degrees // TODO: refactor with voxel-pumpkin, generic block/player orientation module?
    return 'Z'; // north
  } else if (Math.PI - Math.abs(heading) <= Math.PI / 4) { // +/-180 +/- 45
    return 'Z'; // south
  } else if (heading > 0) { // +90 +/- 45
    return 'X'; // west
  } else { // if (heading <= 0) { // -90 +/- 45
    return 'X'; // east
  }
};

GlassPlugin.prototype.enable = function() {
  this.registry.registerBlock('glass', {texture: 'glass', transparent: true, hardness: 0.2, creativeTab: 'glass'});

  this.registerPane('blue');
};

GlassPlugin.prototype.registerPane = function(color) {
  var colorName = ucfirst(color);

  var texture = 'glass_' + color;

  // item
  var self = this;
  this.registry.registerItem('glassPane' + colorName, {
    displayName: colorName + ' Glass Pane',
    itemTexture: texture,
    creativeTab: 'glass',
    onUse: function(held, target) {
      // place X or Z pane depending on facing
      return self.use.useBlock(target, new ItemPile('glassPane' + self.playerOrientation() + colorName)) === undefined;
    },
  });

  // oriented blocks

  this.registry.registerBlock('glassPaneZ' + colorName, {
    creativeTab: false,
    itemDrop: 'glassPane' + colorName,
    displayName: colorName + ' Glass Pane Z',
    itemTexture: texture, // flat, not 3D cube
    texture: texture,     // preload for model below
    blockModel:
      [{from: [0,0,7],
      to: [16,16,2],
      faceData: {
        down: {},
        up: {},
        north: {},
        south: {},
        west: {},
        east: {}
        },
      texture: texture,
      }],
  });

  // same as above but oriented along X axis
  this.registry.registerBlock('glassPaneX' + colorName, {
    creativeTab: false,
    itemDrop: 'glassPane' + colorName,
    displayName: colorName + ' Glass Pane X',
    itemTexture: texture,
    texture: texture,
    blockModel:
      [{from: [7,0,0],
      to: [2,16,16],
      faceData: {
        down: {},
        up: {},
        north: {},
        south: {},
        west: {},
        east: {}
        },
      texture: texture,
      }],
  });
};

GlassPlugin.prototype.disable = function() {
  // TODO: unregister blocks
};

