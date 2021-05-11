const prod = {
  baseUrl: "http://driftbottle.app"
}

const dev = {
  baseUrl: "http://localhost:4000"
}

const config = process.env.NODE_ENV === 'development' ? dev : prod;

module.exports = config;

