import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

import {Logger, TokenManager } from './utils/utils.js'


const configPath = path.resolve("./config.json")
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const workingDir = process.cwd()

let initMsg = `main script started with configs: ${JSON.stringify(config)} in directory: ${workingDir}`
const logger = new Logger()
logger.info(initMsg)

class Enricher {
    constructor() {
        this.config = config
        this._parsedFile = []
        this._parsedInfo
    }

    get parsedFile() {
        return this._parsedFile
    }

    set parsedFile(data) {
        if (!Array.isArray(data)) {
            throw new Error('empty data!')
        }
        this._parsedFile = data.map((item) => ({
            ...item,
            //and then additional things for each entry
        }))
    }

    get parsedInfo() {
        return this._parsedInfo
    }

    //put string with csv filepath
    readCSV(file) {
        // grab some data from input directory
        try {
            const data = fs.readFileSync(file, 'utf-8')

            const parsedData = Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
            })
            let readLogMsg = `parsed ${file}, datalength: ${parsedData.data.length} /n fields: ${parsedData.meta.fields}`
            logger.info(readLogMsg)
            this.parsedFile = parsedData.data
            this._parsedInfo = parsedData.meta
        } catch (error) {
            logger.error(error)
            throw new Error(`an error occurs with file ${file}`)
        }
    }

    connect() {
        //logic of connection to Inventree instance

    }

}

let boost = new Enricher()
boost.readCSV('./input/example.csv')
// console.log(boost.parsedInfo)

async function generateToken() {
    try {
        logger.info('Starting the token generation process...')
        
        const tokenManager = new TokenManager() 
        const token = await tokenManager.generateToken();
        
        logger.info(`Token has been generated : ${token}`)
    } catch (error) {
        console.error('Failed to generate token:', error.message)
        logger.error('Error by generating the token', error.message)
    }
}

generateToken();



