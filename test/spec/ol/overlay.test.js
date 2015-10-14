goog.provide('ol.test.Overlay');

describe('ol.Overlay', function() {
  var target, map;

  var width = 360;
  var height = 180;

  beforeEach(function() {
    target = document.createElement('div');

    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);

    map = new ol.Map({
      target: target,
      view: new ol.View({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  });

  afterEach(function() {
    goog.dispose(map);
    document.body.removeChild(target);
  });

  describe('constructor', function() {

    it('can be constructed with minimal arguments', function() {
      var instance = new ol.Overlay({});
      expect(instance).to.be.an(ol.Overlay);
    });

  });

  describe('#setId()', function() {
    var overlay, target;

    beforeEach(function() {
      target = document.createElement('div');
      overlay = new ol.Overlay({
        element: target,
        position: [0, 0]
      });
      map.addOverlay(overlay);
    });
    afterEach(function() {
      map.removeOverlay(overlay);
    });

    it('sets the overlay identifier', function() {
      expect(overlay.getId()).to.be(undefined);
      overlay.setId('foo');
      expect(overlay.getId()).to.be('foo');
    });

    it('accepts a string or number', function() {
      overlay.setId('foo');
      expect(overlay.getId()).to.be('foo');
      overlay.setId(2);
      expect(overlay.getId()).to.be(2);
    });

  });

});

goog.require('goog.dispose');
goog.require('ol.Map');
goog.require('ol.Overlay');
goog.require('ol.View');
