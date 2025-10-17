const fs = require('fs')
const http = require('http')
const EventEmmiter = require('events')
const { Transform, pipeline }  = require('stream')

const PORT = 3000

class Logger extends EventEmmiter {
    log(message) {
        this.emit('log', `✅ ${message}`)
    }
    warn(message) {
     this.emit('log', `⚠️ ${message}`)
    }
    error(message) {
       this.emit('log', `❌ ${message}`)
    }
}

class UpperCaseStream extends Transform {
 _transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase())
 }
}

const logger = new Logger()

logger.on('log', (msg) => console.log(msg))
logger.on('warn', (msg) => console.log(msg))
logger.on('error', (msg) => console.log(msg))

const server = http.createServer((req, res) => {
    if(req.method === 'GET' && req.url === '/') {
        const src = fs.createReadStream('data.txt')
        const upper = new UpperCaseStream()

        let bytesRead = 0

        src.on('data', (chunk) => bytesRead+=chunk.length)

        src.on('end', () => {
            if(bytesRead === 0) {
             if (!res.writableEnded) {
                    res.writeHead(500, {'content-type': 'text/plain; charset=utf-8'});
                    res.end( logger.warn('Файл пуст!'));
                }
            }
        })

        const dest = fs.createWriteStream('upperCasedata.txt');

        pipeline(src, upper , dest, (err) => {
            if(err) {
                logger.error(err.message)

                if(!res.headersSent) {
                      res.writeHead(500, {'content-type': 'text/plain, charset=utf-8'});
                }

                if(!res.writableEnded) {
                    res.end(logger.error('Ошибка обработки файла!'))
                }
            }
        })

    } else {
         res.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
          res.end(logger.error('NOT FOUND!'));
    }
})

server.listen(PORT, () => logger.log('HTTP сервер запущен!'))