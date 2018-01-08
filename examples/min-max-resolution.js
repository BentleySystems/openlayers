import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import _ol_source_TileJSON_ from '../src/ol/source/TileJSON.js';


/**
 * Create the map.
 */
var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
      minResolution: 200,
      maxResolution: 2000
    }),
    new TileLayer({
      source: new _ol_source_TileJSON_({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      }),
      minResolution: 2000,
      maxResolution: 20000
    })
  ],
  target: 'map',
  controls: defaultControls({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: new View({
    center: [653600, 5723680],
    zoom: 5
  })
});
