import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { log } from 'console'


dotenv.config()  // Завантаження конфігурацій з .env файлу

// Логгер для виведення повідомлень
class Logger {
	constructor(logFilePath = './output/test.log') {
		this.logFilePath = logFilePath

		// Створення папки логів, якщо її немає
		const logDir = path.dirname(logFilePath)
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true })
		}
	}

	// Метод для запису логів
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

// Клас для генерації токену
class TokenManager {
	#inventreeUrl
	#username
	#password
	#token
	#tokenExpiry
	#tokenFile

	
	constructor() {
		this.#inventreeUrl = process.env.INVENTREE_URL
		this.#username = process.env.INVENTREE_USERNAME
		this.#password = process.env.INVENTREE_PASSWORD
		this.#tokenFile = './token.json'
		this.#tokenExpiry = null
		this.#token = null
	}

	set token (value) {
		if (!value) {
			throw new Error('invalid token!')
		}
		this.#token = value
	}

	set tokenExpiry (value) {
		if (isNaN(value) || value <= 0) {
			throw new Error('invalid token expiry!')
		}
		this.#tokenExpiry = value
	}

	get token() {
		return this.#token
	}

	get tokenExpiry() {
		return this.#tokenExpiry
	}

	async generateToken() {
		try {
			const authHeader = `Basic ${Buffer.from(`${this.#username}:${this.#password}`, 'utf-8').toString('base64')}`
			const response = await fetch(`${this.#inventreeUrl}/api/user/token/`, {
				method: 'GET',
				headers: {
					Authorization: authHeader,
				},
			})
	
			if (!response.ok) throw new Error(`Failed to generate token. Status: ${response.status}`)

			const data = await response.json()
			if (!data.token) throw new Error('Token not found in the response!')
			
			this.token = data.token
			return this.token

		} catch (error) {
			console.error('Error during token generation:', error.message)
			throw error
		}
	}
	
}

// Експортуємо необхідні компоненти
export { Logger, TokenManager }
