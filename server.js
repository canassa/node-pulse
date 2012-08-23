'use strict';

/*jshint node:true */


var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    authom = require("authom"),
    querystring = require("querystring"),
    _ = require('lodash'),
    config = require('./config'),
    OAuth = require('oauth').OAuth,
    OAuth2 = require("oauth").OAuth2;


var server = http.createServer();

var front_template = fs.readFileSync('front.js', 'utf-8').replace('{{ url }}', config.base_url);



server.on("request", function (req, res) {

    if (/^\/get/.test(req.url)) {
        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "X-Requested-With",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
        });

        res.end(JSON.stringify(TOTAL));
    }
    else if (/^\/post/.test(req.url)) {
        var body='';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end',function () {

            var post_data = querystring.parse(body);

            if (post_data.service === 'twitter') {
                var oa = new OAuth('https://twitter.com/oauth/request_token',
                                   'https://twitter.com/oauth/access_token',
                                   config.twitter.id, config.twitter.secret,
                                   '1.0A', 'http://node-pulse.herokuapp.com/auth/twitter', 'HMAC-SHA1');

                oa.post('https://api.twitter.com/1/statuses/update.json',
                        post_data.token, post_data.secret,
                        {'status': post_data.message},
                        function (error, data) {

                    res.writeHead(200, {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "X-Requested-With"
                    });

                    res.end(JSON.stringify(data));

                });
            }
            else if (post_data.service === 'facebook') {
                var oa = new OAuth2(config.facebook.id,  config.facebook.secret, 'https://graph.facebook.com');
            }


        });
    }
    else if (/^\/front\.js$/.test(req.url)) {
        res.writeHead(200, {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
        });

        res.end(front_template);
    }
    else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });
        res.end('404 Not Found');
    }

});


authom.createServer({
    service: 'twitter',
    id: config.twitter.id,
    secret: config.twitter.secret
});


authom.createServer({
    service: 'facebook',
    id: config.facebook.id,
    secret: config.facebook.secret
});


function format_google_plus (post) {
    return {
        type: "google",
        id: post.id,
        created: new Date(post.published),
        user: post.actor.displayName,
        avatar: post.actor.image.url,
        message: post.title
    };
}


/**
 * Normalizes the twitter post
 * @param  {Object} post A twitter post with these fields
 *   from_user - The twitter user e.g.: 'ccanassa'
 *   id_str - The tweet unique id
 *   created_at - The tweet date e.g.: 'Sun, 19 Aug 2012 04:55:25 +0000'
 *   profile_image_url - The user avatar url
 *   text - The tweet content
 * @return {Object} A normalized output
 */
function format_twitter (post) {
    return {
        type: "twitter",
        id: post.id_str,
        created: new Date(post.created_at),
        user: post.from_user,
        avatar: post.profile_image_url,
        message: post.text
    };
}



/**
 * Normalizes the Facebook search api output
 * @param  {Object} post The original Facebook post
 * @return {Object} The normalized output
 */
function format_facebook (post) {
    return {
        type: "facebook",
        id: post.id,
        created: new Date(post.created_time),
        user: post.from.name,
        avatar: 'https://graph.facebook.com/' + post.from.id + '/picture',
        message: post.message
    };
}


function get_google_plus (params, callback) {
    var default_params = {
        query: params.query,
        language: 'pt-br',
        maxResults: '20',
        fields: 'items(actor(displayName,image),published,title,id)',
        key: params.key
    };

    var options = {
        host: 'www.googleapis.com',
        path: '/plus/v1/activities?' + querystring.stringify(default_params)
    };


    https.get(options, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                console.log("Unable to parse google plus stream");
                console.log(data);

                callback(GOOGLE);
                return;
            }

            if (data.error) {
                callback({error: true});
                return;
            }

            data = data.items.map(format_google_plus);
            callback(data);
        });
    });
}


function get_twitter (params, callback) {
    var default_params = {
        q: params.query,
        language: 'pt'
    };

    var options = {
        host: 'search.twitter.com',
        path: '/search.json?' + querystring.stringify(default_params)
    };


    http.get(options, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                console.log("Unable to parse twitter stream");
                console.log(data);

                callback(TWITTER);
                return;
            }
            data = data.results.map(format_twitter);
            callback(data);
        });
    });
}

function get_facebook (params, callback) {
    var default_params = {
        q: params.query,
        type: 'post',
        fields: 'from,message,type,created_time'
    };

    var options = {
        host: 'graph.facebook.com',
        path: '/search?' + querystring.stringify(default_params)
    };


    https.get(options, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                console.log("Unable to parse Facebook stream");
                console.log(data);

                callback(FACEBOOK);
                return;
            }


            if (data.data === undefined) {
                console.log('Facebook error:', data);
                callback(false);
            }
            else {
                data = data.data.filter(function (d) {return d.message !== undefined;}).map(format_facebook);
                callback(data);
            }
        });
    });
}


function concat_posts (posts) {
    var BUFFER_COUNT = 50;

    return _.chain(posts)
            .flatten(posts)
            .sortBy('created')
            .first(BUFFER_COUNT)
            .value()
            .reverse();
}

exports.concat_posts = concat_posts;

var TOTAL = [];

var GOOGLE = [];
var TWITTER = [];
var FACEBOOK = [];


function fetch_data () {
    get_google_plus({query: config.query, key: config.google.secret}, function (posts) {
        GOOGLE = posts;
        TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK]);
    });

    get_twitter({query: config.query}, function (posts) {
        TWITTER = posts;
        TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK]);
    });

    get_facebook({query: config.query}, function (posts) {
        if (posts !== false) {
            FACEBOOK = posts;
            TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK]);
        }
    });
}


fetch_data();
setInterval(fetch_data, config.interval);

var get_avatar = {
    twitter: function (data) {
        return 'https://api.twitter.com/1/users/profile_image?screen_name=' + data.data.screen_name + '&size=bigger'
    },

    facebook: function (data) {
        return 'teste';
    }
};

var get_user_name = {
    twitter: function (data) {
        return data.data.screen_name;
    },

    facebook: function (data) {
        return 'teste';
    }
};


authom.on("auth", function(req, res, data) {
    var login_data = {
        service: data.service,
        token: data.token,
        secret: data.secret,
        avatar: get_avatar[data.service](data),
        user_name: get_user_name[data.service](data),
    };

    var template = '<script>' +
        'window.opener.postMessage(' + JSON.stringify(login_data) + ', "*");' +
        'window.close();' +
    '</script>';

    res.writeHead(200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Content-Type": "text/html",
        "Content-Length": template.length
    });

    res.end(template);
});


authom.on("error", function (req, res, data) {
    console.log(data);

    data = new Buffer("An error occurred: " + JSON.stringify(data));

    res.writeHead(500, {
        "Content-Type": "text/plain",
        "Content-Length": data.length
    });

    res.end(data);
});


authom.listen(server);
server.listen(config.port);
console.log('Listening on port ' + config.port);