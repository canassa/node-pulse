var CV = {
    api_url: '{{ url }}',

    service: '',
    token: '',
    secret: '',

    post: function (message, callback) {
        var data = {
            service: CV.service,
            token: CV.token,
            secret: CV.secret,
            message: message
        };

        $.post(CV.api_url + '/post', data, callback);
    }
}

window.addEventListener('message', function (e) {
    if (e.origin !== CV.api_url) return;

    CV.service = e.data.service;
    CV.token = e.data.token;
    CV.secret = e.data.secret;

    $('body').trigger("connected", {service: CV.service, user_name: e.data.user_name, avatar: e.data.avatar});

}, false);