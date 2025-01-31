import path from 'path'
import fs from 'fs'

class Logger {
	constructor(logFilePath = './output/test.log') {
		this.logFilePath = logFilePath

		const logDir = path.dirname(logFilePath)
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true })
		}
	}

	logging(level, message) {
		const timestamp = new Date().toISOString()
		const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`
		console.log(logMessage)
		fs.appendFileSync(this.logFilePath, logMessage + '\n', 'utf8')
	}

	info(message) {
		this.logging('info', message)
	}

	warn(message) {
		this.logging('warn', message)
	}

	error(message) {
		this.logging('error', message)
	}

	debug(message) {
		this.logging('debug', message)
	}
}

export { Logger }