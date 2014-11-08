var _       = require('underscore')._;
var casper  = require('casper').create({
    clientScripts: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/underscore/underscore.js'
    ]
    // , verbose: true
    // , logLevel: 'debug'
});
var utils   = require('utils');
var albums  = require('albums/list');
var WIKIPEDIA_URL = 'http://www.wikipedia.org/';

casper.on('artist.loaded', function() {
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
            name: this._requestedArtist,
            albums: albumList
        };
        utils.dump(artist);
        // @TODO: go to bed
    }
});

casper.start().each(albums, function(_self, artistName) {
    _self.thenOpen(WIKIPEDIA_URL, function() {
        this.fill('form.search-form[action="//www.wikipedia.org/search-redirect.php"]', {
            'search': artistName
        }, true);
    }).then(function() {
        /**
         * @TODO: emitting with parameters
         * or write a god damn plug-in
         */
        _self._requestedArtist = artistName;

        // Let's go!
        _self.emit('artist.loaded');
    });
});

casper.run();
