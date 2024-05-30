const { libutil } = require('../Util/Utils')
module.exports = (req, res, next) => {

    libutil.logger(`incoming request ${req.method} ${req.path}`)
    next()

}