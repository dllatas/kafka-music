const fs = require('fs');
const util = require('util');
const request = require('request');
const settings = require('./settings')['spotify'];

const spotify = {

  _retry: {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: 'Basic ' + new Buffer(settings.id.concat(':').concat(settings.password)).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { 
      grant_type: 'client_credentials' 
    }
  },

  _options: {
    method: 'GET',
    url: 'https://api.spotify.com/v1/search',
    qs: { 
      q: 'nin', 
      type: 'album' 
    },
    headers: {
      'Cache-Control': 'no-cache',
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

    fs.readFileSync('./spotify_token.json', function (err, data) {
      
      if (err) {
        throw err; 
      }
      
      _this._options.headers.Authorization = data.token_type.concat(' ').concat(data.access_token);
    });

    let response = await util.promisify(request)(_this._options);

    if (response.statusCode === 401) {
      
      response = await util.promisify(request)(_this._retry);
      response = JSON.parse(response.body);

      const token = {
        'token_type': response.token_type,
        'access_token': response.access_token
      };

      fs.writeFileSync('./spotify_token.json', JSON.stringify(token), function(err) {
        if (err) {
          throw err;
        }
      });

      const options = Object.assign({}, _this._options);
      options.headers.Authorization = response.token_type.concat(' ').concat(response.access_token);

      response = await util.promisify(request)(options);
    }

    
    if (!_this._checkStatuCode(_this._statuCodes, response.statusCode)) {
      throw new Error(response.statusCode + ': ' + response.statusMessage); 
    }

    response = JSON.parse(response.body);

    const payloads = _this._generatePayloads(response);

    return payloads;
  }
};

module.exports = spotify.run.bind(spotify);