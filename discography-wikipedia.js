var fs = require('fs');
var _       = require('underscore')._;
var _str   = require('underscore.string');
var Casper  = require('casper').Casper;
var utils   = require('utils');

var mainDir = "./data/discography-wikipedia-collection";

var albums  = require(mainDir + '/list');
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

Spectre.prototype.getRequestedArtist = function() {
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

var getHeadlineString = function(name) {
    var k = "=";
    var string = "";
    var length = (name.length + 2);
 
    for (var i = 0; i < length; i++) {
        string += k;
    };
 
    return string;
}

var artistToMarkdown = function(list) {
    if (!list || !list.length) {
        return;
    }
    var artists = list;
    
    artists = _.sortBy(artists, function(artistItem) {
        return artistItem.name;
    });

    var fileContent = "";
    _.each(artists, function(artist, index) {
        var artistString = "";
        artistString += artist.name + "\n" + getHeadlineString(artist.name) + "\n";

        _.each(artist.albums, function(album, index) {
            var count = (index+1);
            var albumString = "\n" + count + ". " + album;
            artistString += albumString;
        });

        artistString += "\n\n---\n\n";
        fileContent += artistString;
    });

    var date = new Date();
    var FILE_NAME = ['albums', date.toISOString()].join(', ') + ".md";
    fs.write(mainDir + "/" + FILE_NAME, fileContent, 'a');
};

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
    artistToMarkdown(this.managed);
}).then(function() {
    utils.dump("\n Finished task");
});

spectre.run();
