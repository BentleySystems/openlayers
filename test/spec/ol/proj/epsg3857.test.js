import {getPointResolution, transform, get as getProjection, clearAllProjections, addCommon} from '../../../../src/ol/proj.js';
import _ol_proj_EPSG3857_ from '../../../../src/ol/proj/EPSG3857.js';

describe('ol.proj.EPSG3857', function() {

  afterEach(function() {
    clearAllProjections();
    addCommon();
  });

  describe('fromEPSG4326()', function() {

    it('transforms from geographic to Web Mercator', function() {
      const forward = _ol_proj_EPSG3857_.fromEPSG4326;
      const edge = _ol_proj_EPSG3857_.HALF_SIZE;

      const tolerance = 1e-5;

      const cases = [{
        g: [0, 0],
        m: [0, 0]
      }, {
        g: [-180, -90],
        m: [-edge, -edge]
      }, {
        g: [180, 90],
        m: [edge, edge]
      }, {
        g: [-111.0429, 45.6770],
        m: [-12361239.084208, 5728738.469095]
      }];

      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const point = cases[i].g;
        const transformed = forward(point);
        expect(transformed[0]).to.roughlyEqual(cases[i].m[0], tolerance);
        expect(transformed[1]).to.roughlyEqual(cases[i].m[1], tolerance);
      }
    });

  });

  describe('getPointResolution', function() {

    it('returns the correct point scale at the equator', function() {
      // @see http://msdn.microsoft.com/en-us/library/aa940990.aspx
      const epsg3857 = getProjection('EPSG:3857');
      const resolution = 19.11;
      const point = [0, 0];
      expect(getPointResolution(epsg3857, resolution, point)).
        to.roughlyEqual(19.11, 1e-1);
    });

    it('returns the correct point scale at the latitude of Toronto',
      function() {
        // @see http://msdn.microsoft.com/en-us/library/aa940990.aspx
        const epsg3857 = getProjection('EPSG:3857');
        const epsg4326 = getProjection('EPSG:4326');
        const resolution = 19.11;
        const point = transform([0, 43.65], epsg4326, epsg3857);
        expect(getPointResolution(epsg3857, resolution, point)).
          to.roughlyEqual(19.11 * Math.cos(Math.PI * 43.65 / 180), 1e-9);
      });

    it('returns the correct point scale at various latitudes', function() {
      // @see http://msdn.microsoft.com/en-us/library/aa940990.aspx
      const epsg3857 = getProjection('EPSG:3857');
      const epsg4326 = getProjection('EPSG:4326');
      const resolution = 19.11;
      let latitude;
      for (latitude = 0; latitude <= 85; ++latitude) {
        const point = transform([0, latitude], epsg4326, epsg3857);
        expect(getPointResolution(epsg3857, resolution, point)).
          to.roughlyEqual(19.11 * Math.cos(Math.PI * latitude / 180), 1e-9);
      }
    });

  });

});
