goog.provide('ol.test.coordinate');

describe('ol.coordinate', function() {

  describe('#add', function() {
    var coordinate,
        delta;

    beforeEach(function() {
      coordinate = [50.73, 7.1];
      delta = [-2, 3];
    });

    it('returns a coordinate', function() {
      var returnedCoordinate = ol.coordinate.add(coordinate, delta);
      expect(returnedCoordinate).to.be.an('array');
      expect(returnedCoordinate).to.have.length(2);
    });

    it('adds the delta', function() {
      var returnedCoordinate = ol.coordinate.add(coordinate, delta);
      expect(returnedCoordinate[0]).to.eql(48.73);
      expect(returnedCoordinate[1]).to.eql(10.1);
    });

    it('modifies in place', function() {
      ol.coordinate.add(coordinate, delta);
      expect(coordinate[0]).to.eql(48.73);
      expect(coordinate[1]).to.eql(10.1);
    });
  });

  describe('#format', function() {
    var coordinate;
    beforeEach(function() {
      coordinate = [6.6123, 46.7919];
    });

    it('rounds the values', function() {
      var string = ol.coordinate.format(coordinate, '{x} {y}', 0);
      expect(string).to.eql('7 47');
    });

    it('handles the optional fractionDigits param', function() {
      var string = ol.coordinate.format(coordinate, '{x} {y}', 3);
      expect(string).to.eql('6.612 46.792');
    });
  });

  describe('#closestOnSegment', function() {
    it('can handle points where the foot of the perpendicular is closest',
        function() {
          var point = [2, 5];
          var segment = [[-5, 0], [10, 0]];
          expect(ol.coordinate.closestOnSegment(point, segment))
              .to.eql([2, 0]);
        });
    it('can handle points where the foot of the perpendicular is not closest',
        function() {
          var point = [0, -6];
          var segment = [[-5, 0], [0, -1]];
          expect(ol.coordinate.closestOnSegment(point, segment))
              .to.eql([0, -1]);
        });
  });

  describe('#squaredDistanceToSegment', function() {
    it('can handle points where the foot of the perpendicular is closest',
        function() {
          var point = [2, 5];
          var segment = [[-5, 0], [10, 0]];
          expect(ol.coordinate.squaredDistanceToSegment(point, segment))
              .to.eql(25);
        });
    it('can handle points where the foot of the perpendicular is not closest',
        function() {
          var point = [0, -6];
          var segment = [[-5, 0], [0, -1]];
          expect(ol.coordinate.squaredDistanceToSegment(point, segment))
              .to.eql(25);
        });

  });

});

goog.require('ol.coordinate');
