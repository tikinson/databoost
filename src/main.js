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
            //this._parsedInfo can give us the idea about data that we put into input file.
            //JSON that contains model of data that valuable for our case i created manually
            //TODO: auto creating data model
            this._parsedInfo = parsedData.meta
            
        } catch (error) {
            logger.error(error)
            throw new Error(`an error occurs with file ${file}`)
        }
    }

    async connect() {
        //logic of connection to Inventree instance
        const manager = new TokenManager()
        const checkingResult = await manager.checkToken()
        console.log('TokenManager check', checkingResult);
        
    }

}

let boost = new Enricher()
boost.connect()
boost.readCSV('./input/example.csv')





