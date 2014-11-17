var _       = require('underscore')._;
var Casper  = require('casper').Casper;
var utils   = require('utils');
var albums  = require('./albums/list');
var WIKIPEDIA_URL = 'http://www.wikipedia.org/';

var Spectre = function() {
    Spectre.super_.apply(this, arguments);
    this.managed = [];
    this.artists = [];
    this._requestedArtist = null;
};

utils.inherits(Spectre, Casper);

Spectre.prototype.addArtist = function(artist) {
    this.artists.push(artist);
    return this;
};

Spectre.prototype.addManagedArtist = function(artist) {
    this.managed.push(artist);
    this._requestedArtist = null;
    return this;
};

Spectre.prototype.setRequestedArtist = function(name) {
    this._requestedArtist = name;
    return this;
};

Spectre.prototype.getRequestedArtist = function(name) {
    return this._requestedArtist;
};

var spectre = new Spectre({
    clientScripts: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/underscore/underscore.js'
    ]
    , verbose: true
    // , logLevel: 'debug'
});

spectre.on('artist.loaded', function() {
    var albumList = [];
    var artist = null;
    albumList = this.evaluate(function() {
        var discographyString = /(d|D)(iscography)/g; // quick and dirty
        var contentText = $('#mw-content-text');
        var headlines = $('h2', contentText);
        var matchingHeadline = _.find(headlines, function(headline) {
            return headline.innerHTML.match(discographyString);
        });
        var albumList = [];
        var listElement = null;
        if (matchingHeadline) {
            matchingHeadline = $(matchingHeadline);
            var next = matchingHeadline.next();
            // @TODO: there has to be smoother way
            while (next) {
                if (next[0].nodeName.toLowerCase() !== 'ul') {
                    next = next.next();
                } else {
                    listElement = next;
                    next = null;
                }
            }
        }

        if (listElement) {
            var childElements = $('li', listElement);
            _.each(childElements, function(element) {
                albumList.push($(element).text());
            });
        }

        return albumList;
    });

    if (albumList.length) {
        artist = {
            name: this.getRequestedArtist(),
            albums: albumList
        };
        this.addManagedArtist(artist);
    }
});

spectre.start().each(albums, function(_self, artistName) {
    _self.thenOpen(WIKIPEDIA_URL, function() {
        this.fill('form.search-form[action="//www.wikipedia.org/search-redirect.php"]', {
            'search': artistName
        }, true);
    }).then(function() {
        _self.addArtist(artistName);
        _self.setRequestedArtist(artistName);
        _self.emit('artist.loaded');
    });
}).then(function() {
    utils.dump(this.managed);
});

spectre.run();
