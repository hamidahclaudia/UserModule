module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
    URL: process.env.BASE_URI || 'http://localhost:3000',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://<claudiahamidah>:<0135hore>@ds261114.mlab.com:61114/testgigelid',
    JWT_SECRET: process.env.JWT_SECRET || 'secret1'
}
