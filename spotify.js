const util = require('util');
const request = require('request');

const spotify = {

  _options: {
    method: 'GET',
    url: 'https://api.spotify.com/v1/search',
    qs: { q: 'nin', type: 'album' },
    headers: 
          {
            'Cache-Control': 'no-cache',
            Authorization: 'Bearer BQCl7H3wrsd90MnRWAGYYuG9QT_XseRYVcGtXHehsjH4XGxjEPuSazgAHxjPs61lytRIWlOuTQTDJ-BEYWE'
          } 
  },

  _statuCodes: ['4', '5'], 

  _payloadDispatcher: function(it, method) {

    const dispatcher = {

      'single': function(it) {
        return it.map(i => { return { topic: 'nin', messages: i.name }; });
      },
      
      'multiple': function(it) {
        const itNames = it.map(i => i.name);
        return [ { topic: 'nin', messages: itNames } ];
      }
    };

    return dispatcher[method](it);

  },
  
  _generatePayloads: function(response, method = 'multiple') {

    const _this = this;

    const items = response.albums.items;

    return _this._payloadDispatcher(items, method);
  },
    
  _checkStatuCode: function(statuCodes, statusCode) {

    if (!Array.isArray(statuCodes)) {
      throw new Error('statuCodes should be an array');
    }

    if (typeof statusCode !== 'string') {
      statusCode = statusCode.toString();
    }

    if (statuCodes.includes(statusCode.substring(0, 1))) {
      return false;
    }

    return true;
  },
      
  run: async function() {

    const _this = this;
    
    let response = await util.promisify(request)(_this._options);
    
    if (!_this._checkStatuCode(_this._statuCodes, response.statusCode)) {
      // Retry or get new token
      throw new Error(response.statusCode + ': ' + response.statusMessage); 
    }

    response = JSON.parse(response.body);

    const payloads = _this._generatePayloads(response);

    return payloads;
  }
};

module.exports = spotify.run.bind(spotify);