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
    util = require('util'),
    OAuth2 = require("oauth").OAuth2;


var server = http.createServer();

var front_template = fs.readFileSync('front.js', 'utf-8').replace('{{ url }}', config.base_url);

var BAD_WORDS = fs.readFileSync('bad_words.txt', 'utf-8').split('\n');

var latin_map = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};

function remove_diacritics (str) {
    return str.replace(/[^A-Za-z0-9\[\] ]/g, function (a) {
        return latin_map[a]||a
    })
}

exports.remove_diacritics = remove_diacritics;


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

                    res.end('{"result": "ok"}');

                });
            }
            else if (post_data.service === 'facebook') {
                var oa = new OAuth2(config.facebook.id,  config.facebook.secret, 'https://graph.facebook.com');
                var msg = querystring.stringify({message: post_data.message});

                oa._request("POST", 'https://graph.facebook.com/me/feed', {}, msg, post_data.token, function (e, d) {
                    if (e) console.log('Facebook post error:', e);

                    res.writeHead(200, {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "X-Requested-With"
                    });

                    res.end('{"result": "ok"}');

                });
            }
            else if (post_data.service === 'google') {

                var data = {
                    type: "google",
                    id: (Date.now()) + 'x' + Math.round(Math.random() *1E18),
                    created: new Date(),
                    user: post_data.user_name,
                    avatar: post_data.avatar,
                    message: post_data.message
                };

                LOCAL.push(data);
                LOCAL.splice(50);

                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "X-Requested-With"
                });

                res.end('{"result": "ok"}');

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
    secret: config.facebook.secret,
    scope: config.facebook.scope
});

authom.createServer({
    service: 'google',
    id: config.google.id,
    secret: config.google.secret
});


/**
 * Normalizes a Google+ Post
 * @param  {Object} post The post from the Google+ API
 * @return {Object} The normalized Post
 */
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
            if (res.statusCode !== 200) {
                util.error("Google responded with an invalid status: ", res.statusCode);
                callback(GOOGLE);
                return;
            }

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
                util.error("Error in google plus stream");
                util.error(JSON.stringify(data));

                callback(GOOGLE);
                return;
            }

            data = data.items.map(format_google_plus);
            callback(data);
        });
    }).on('error', function (e) {
        console.log('Google fetch error: ' + e.message);
        callback(GOOGLE);
        return;
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
            if (res.statusCode !== 200) {
                util.error("Twitter responded with an invalid status: ", res.statusCode);
                callback(TWITTER);
                return;
            }

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
    }).on('error', function (e) {
        console.log('Twitter fetch error: ' + e.message);
        callback(TWITTER);
        return;
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
            if (res.statusCode !== 200) {
                util.error("Facebook responded with an invalid status: ", res.statusCode);
                callback(FACEBOOK);
                return;
            }

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
    }).on('error', function (e) {
        console.log('Facebook fetch error: ' + e.message);
        callback(FACEBOOK);
        return;
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

function filter_bad_words (post_list, bad_words) {
    return post_list.filter(function (post) {
        // Remove accents and convert to lower case
        var message = remove_diacritics(post.message).toLowerCase();

        for (var i=bad_words.length; i--;) {
            if (message.indexOf(bad_words[i]) !== -1) return false;
        }
        return true;
    })
}

exports.filter_bad_words = filter_bad_words;
exports.concat_posts = concat_posts;

var TOTAL = [];

var LOCAL = [];
var GOOGLE = [];
var TWITTER = [];
var FACEBOOK = [];


function fetch_data () {
    get_google_plus({query: config.query, key: config.google.app_key}, function (posts) {
        GOOGLE = filter_bad_words(posts);
        TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK, LOCAL]);
    });

    get_twitter({query: config.query}, function (posts) {
        TWITTER = filter_bad_words(posts);
        TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK, LOCAL]);
    });

    get_facebook({query: config.query}, function (posts) {
        if (posts !== false) {
            FACEBOOK = filter_bad_words(posts);
            TOTAL = concat_posts([GOOGLE, TWITTER, FACEBOOK, LOCAL]);
        }
    });
}


var get_avatar = {
    twitter: function (data) {
        return 'https://api.twitter.com/1/users/profile_image?screen_name=' + data.data.screen_name + '&size=bigger'
    },

    google: function (data) {
        return data.data.picture ? data.data.picture + '?sz=50' : undefined;
    },

    facebook: function (data) {
        return 'https://graph.facebook.com/' + data.data.username + '/picture?type=square';
    }
};

var get_user_name = {
    twitter: function (data) {
        return data.data.screen_name;
    },

    google: function (data) {
        return data.data.name;
    },

    facebook: function (data) {
        return data.data.name;
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


fetch_data();
setInterval(fetch_data, config.interval);


authom.listen(server);
server.listen(config.port);
console.log('Listening on port ' + config.port);