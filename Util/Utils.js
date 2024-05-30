const MongoClient = require('mongodb').MongoClient
const libchalk = require('chalk')
const libmoment = require('moment')
const libfs = require('fs')
const libpath = require('path')


const util = {}


util.getdbconnection = async (callback) => {

    const MongoServerConnection = new MongoClient(process.env.MONGO_URL)

    try {
        //mongodb connection
        await MongoServerConnection.connect()
        util.logger("Mongo DB Connected Successfully.....", 1)
        await callback(MongoServerConnection.db())
        util.logger("Data Was Served..", 1)
    }
    catch (error) {
        util.logger(error, 3)
    }
    finally {
        await MongoServerConnection.close()
        util.logger("Mongo DB disconnected Successfully.....", 1)
    }
}



util.logchalkpicker = {
    0: libchalk.white,
    1: libchalk.green,
    2: libchalk.yellow,
    3: libchalk.red
}
util.logsignpicker = {
    0: "[*]",
    1: "[+]",
    2: "[!]",
    3: "[-]"
}


util.logger = (msg, escalation = 0) => {

    const currentdatatime = libmoment().format('DD-MM-YYYY HH:mm:ss')

    const currentlogfile = ` ${libmoment().format('DD-MM-YYYY')}.log`;

    const logtoprint = `${util.logsignpicker[escalation]} ${currentdatatime}  ${msg}`

    console.log(util.logchalkpicker[escalation](logtoprint))



    libfs.access(libpath.join(process.cwd(), "logs", currentlogfile), libfs.constants.f_OK, (error) => {

        if (error) {
            libfs.writeFileSync(libpath.join(process.cwd(), "logs", currentlogfile), logtoprint)
        }
        else {
            libfs.appendFileSync(libpath.join(process.cwd(), "logs", currentlogfile), `\n ${logtoprint}`)
        }
    })


}


util.deleteOldLogFiles = () => {
    const logsDirectory = libpath.join(process.cwd(), "logs");
    const oneWeekAgo = libmoment().subtract(1, 'week');

    libfs.readdir(logsDirectory, (err, files) => {
        if (err) {
            util.logger(err, 3);
            return;
        }

        files.forEach(file => {
            const filePath = libpath.join(logsDirectory, file);
            const fileStat = libfs.statSync(filePath);
            const fileModifiedDate = libmoment(fileStat.mtime);
            if (fileStat.isFile() && fileModifiedDate.isBefore(oneWeekAgo)) {
                libfs.unlinkSync(filePath);
                util.logger(`Deleted old log file: ${file}`, 1);
            }
        });
    });
};

util.deleteOldLogFiles();
setInterval(util.deleteOldLogFiles, 24 * 60 * 60 * 1000);



module.exports.libutil = util