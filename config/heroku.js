module.exports = {
    port: process.env.PORT,
    query: process.env.QUERY,
    interval: process.env.INTERVAL || 60000,
    base_url: process.env.BASE_URL,

    twitter: {
        id: process.env.TWITTER_ID,
        secret: process.env.TWITTER_SECRET,
    },

    facebook: {
        id: process.env.FACEBOOK_ID,
        secret: process.env.FACEBOOK_SECRET,
        scope: ['publish_stream']
    },

    google: {
        id: process.env.GOOGLE_ID,
        secret: process.env.GOOGLE_SECRET,
        app_key: process.env.GOOGLE_APP_KEY
    }
};