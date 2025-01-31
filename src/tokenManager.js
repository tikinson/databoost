import fs from 'fs'
import dotenv from 'dotenv'
import { Logger } from './logger.js'

dotenv.config()  

class TokenManager {
	#inventreeUrl
	#username
	#password
	#token
	#tokenExpiry
	#tokenFilePath

	
	constructor() {
		this.#inventreeUrl = process.env.INVENTREE_URL
		this.#username = process.env.INVENTREE_USERNAME
		this.#password = process.env.INVENTREE_PASSWORD
		this.#tokenFilePath = './token.json'
		this.#tokenExpiry = null
		this.#token = null

		this.logger = new Logger()
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

	// init token, keeps it in private field, write it in file after generation
	async generateToken() {
		try {
			this.logger.info('Starting token generation')
			const authHeader = `Basic ${Buffer.from(`${this.#username}:${this.#password}`, 'utf-8').toString('base64')}`
			const response = await fetch(`${this.#inventreeUrl}/api/user/token/`, {
				method: 'GET',
				headers: {
					Authorization: authHeader,
				},
			})
	
			if (!response.ok) throw new Error(`Failed to generate token. Status: ${response.status}`)

			const data = await response.json()

			if (!data.token) {
				throw new Error('Token not found in the response!')
			} else {
				this.#token = data.token
				this.logger.info(`token has been generated`)
				fs.writeFileSync(this.#tokenFilePath, this.#token)
				this.logger.info(`token has been written in ${this.#tokenFilePath}`)
				return this.#token
			}
		} catch (error) {
			console.error('Error during token generation:', error.message)
			throw error
		}
	}

	// if there is no token this method calls token generation. if file with token exists - it reads token from file

	async checkToken() {
		this.logger.info("Starting checking token")
		if (!fs.existsSync(this.#tokenFilePath)){
			await this.generateToken()
		} else {
			const filedata = fs.readFileSync(this.#tokenFilePath)
			this.#token = filedata.toString('utf-8')
			this.logger.info(`Token ${this.#token} readed from ${this.#tokenFilePath}`)
		}
		return this.#token
	}	
}

export { TokenManager }
