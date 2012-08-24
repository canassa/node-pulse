var CV = {
    api_url: '{{ url }}',

    service: '',
    token: '',
    secret: '',

    post_data: {},

    post: function (message, callback) {
        CV.post_data.message = message;

        $.post(CV.api_url + '/post', CV.post_data, callback);
    }
}

window.addEventListener('message', function (e) {
    if (e.origin !== CV.api_url) return;

    CV.post_data.service = e.data.service;
    CV.post_data.token = e.data.token;
    CV.post_data.secret = e.data.secret;

    if (e.data.service === 'google') {
        CV.post_data.user_name = e.data.user_name;
        CV.post_data.avatar = e.data.avatar;
    }

    $('body').trigger("connected", {service: CV.post_data.service, user_name: e.data.user_name, avatar: e.data.avatar});

}, false);