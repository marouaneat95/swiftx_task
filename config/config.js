require('dotenv').config()

module.exports = {
  development: {
    url: "postgres://kfmwpvqh:nHcZiMVT78Vfso4Dl15Cr7_zhQi-XSre@abul.db.elephantsql.com/kfmwpvqh ",
    dialect: 'postgres',
  },
  test: {
    url: "postgres://kfmwpvqh:nHcZiMVT78Vfso4Dl15Cr7_zhQi-XSre@abul.db.elephantsql.com/kfmwpvqh ",
    dialect: 'postgres',
  },
  production: {
    url: "postgres://kfmwpvqh:nHcZiMVT78Vfso4Dl15Cr7_zhQi-XSre@abul.db.elephantsql.com/kfmwpvqh ",
    dialect: 'postgres',
  },
}
