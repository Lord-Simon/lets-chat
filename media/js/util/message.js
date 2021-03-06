'use strict';

if (typeof window !== 'undefined' && typeof exports === 'undefined') {
    if (typeof window.utils !== 'object') {
        window.utils = {};
    }
}

if (typeof exports !== 'undefined') {
    var _ = require('underscore');
}

(function(exports) {
    //
    // Message Text Formatting
    //


    function getBaseUrl() {
        var parts = window.location.pathname.split('/');

        parts = _.filter(parts, function(part) {
            return part.length;
        });

        if (parts.length) {
            parts.splice(parts.length - 1, 1);
        }

        var path = window.location.origin;

        if (parts.length) {
            path = path + '/' + parts.join('/');
        }

        return path + '/';
    }

    function trim(text) {
        return text.trim();
    }

    function mentions(text) {
        var mentionPattern = /\B@([\w\.]+)(?!@)\b/g;
        return text.replace(mentionPattern, '<strong>@$1</strong>');
    }

    function roomLinks(text, data) {
        if (!data.rooms) {
            return text;
        }

        var slugPattern = /\B(\#[a-z0-9_]+)\b/g;

        return text.replace(slugPattern, function(slug) {
            var s = slug.substring(1);
            var room = data.rooms.find(function(room) {
                return room.attributes.slug === s;
            });

            if (!room) {
                return slug;
            }

            return '<a href="#!/room/' + room.id + '">&#35;' + s + '</a>';
        });
    }

    function uploads(text) {
        var pattern = /^\s*(upload:\/\/[-A-Z0-9+&*@#\/%?=~_|!:,.;'"!()]*)\s*$/i;

        return text.replace(pattern, function(url) {
            return getBaseUrl() + url.substring(9);
        });
    }

    function links(text) {
        var imagePattern = /^\s*((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;'"!()]*[-A-Z0-9+&@#\/%=~_|][.](jpe?g|png|gif))\s*$/i,
            videoPattern = /^\s*((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;'"!()]*[-A-Z0-9+&@#\/%=~_|][.](webm|mp4))\s*$/i,
            audioPattern = /^\s*((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;'"!()]*[-A-Z0-9+&@#\/%=~_|][.](mp3|wav|ogg))\s*$/i,
            linkPattern = /((https?|ftp):\/\/[-A-Z0-9+&*@#\/%?=~_|!:,.;'"!()]*[-A-Z0-9+&@#\/%=~_|])/ig;

        if (imagePattern.test(text)) {
            return text.replace(imagePattern, function(url) {
                var uri = encodeURI(_.unescape(url));
                return '<a class="thumbnail" href="' + uri +
                    '" target="_blank"><img data-src="' + uri +
                    '" src="/media/img/loading.gif" alt="Pasted Image" /></a>';
            });
        } else if (videoPattern.test(text)) {
            return text.replace(videoPattern, function(url) {
                var uri = encodeURI(_.unescape(url));
                return '<video controls loop preload="metadata" style="width: auto; max-height: 420px;"><source src="' + uri +
                    '" "></video>';
            });
        } else if (audioPattern.test(text)) {
            return text.replace(audioPattern, function(url) {
                var exttype = '';
                if (audioPattern.exec(text)[3] == "mp3"){
                    exttype= 'type="audio/mpeg"';
                } else if (audioPattern.exec(text)[3] == "wav") {
                    exttype= 'type="audio/wav"';
                } else if (audioPattern.exec(text)[3] == "ogg") {
                    exttype= 'type="audio/ogg"';
                }
                var uri = encodeURI(_.unescape(url));
                return '<audio controls preload="metadata"><source src="' + uri +
                    '" ' + exttype +'></audio>';
            });
        } else {
            return text.replace(linkPattern, function(url) {
                var uri = encodeURI(_.unescape(url));
                return '<a href="' + uri + '" target="_blank">' + url + '</a>';
            });
        }
    }

    function emotes(text, data) {
        var regex = new RegExp('\\B(:[a-z0-9_\\+\\-]+:?)[\\b]?', 'ig');

        return text.replace(regex, function(group) {
            var key = group.split(':')[1];
            var emote = _.find(data.emotes, function(emote) {
                return emote.emote === key;
            });

            if (!emote) {
                return group;
            }

            var image = _.escape(emote.image),
                emo = _.escape(':' + emote.emote + ':'),
                size = _.escape(emote.size || 20);

            return '<img class="emote" src="' + image + '" title="' + emo + '" alt="' + emo + '" width="' + size + '" height="' + size + '" />';
        });
    }

    function replacements(text, data) {
        _.each(data.replacements, function(replacement) {
            text = text.replace(new RegExp(replacement.regex, 'ig'), replacement.template);
        });
        return text;
    }

    exports.format = function(text, data) {
        var pipeline = [
            trim,
            mentions,
            roomLinks,
            uploads,
            links,
            emotes,
            replacements
        ];

        _.each(pipeline, function(func) {
            text = func(text, data);
        });

        return text;
    };

})(typeof exports === 'undefined' ? window.utils.message = {} : exports);
