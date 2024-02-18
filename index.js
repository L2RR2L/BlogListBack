

const app = require('./app')
const config = require('./utility/config')
const logger = require('./utility/logger')

app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`)
})