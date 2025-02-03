import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

import { TokenManager } from './tokenManager.js'
import { Logger } from  './logger.js'
import { DataResolver } from './dataResolver.js'
import { RequestHandler } from './requestHandler.js'


const configPath = path.resolve("./config.json")
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const workingDir = process.cwd()

const initMsg = `main script started with configs: ${JSON.stringify(config)} in directory: ${workingDir}`
const logger = new Logger()
logger.warn('<====================== !!!DATABOOST APP HAS BEEN STARTED!!! =========================>')
logger.info(initMsg)

class Enricher {
    constructor() {
        this.config = config
        this._parsedFile = []//array with objects that we parsed 
        this._parsedInfo
        this.inputDataModel
        this.expectedDataModel = JSON.parse(fs.readFileSync('./output/model.json')) //must be specified by user
        this.credentials
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

    async connect() {
        //logic of connection to Inventree instance
        const tokenManager = new TokenManager()
        const checkingResult = await tokenManager.checkToken()
        const credentials = await tokenManager.getRequestInfo()
        this.credentials = credentials
        console.log('TokenManager check', checkingResult)
        return this.credentials
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
            logger.info(`parsed ${file}, datalength: ${parsedData.data.length} /n fields: ${parsedData.meta.fields}`)
            this.parsedFile = parsedData.data
            //this._parsedInfo can give us the idea about data that we put into input file.
            this._parsedInfo = parsedData.meta
            //console.log(this._parsedInfo);
            
        } catch (error) {
            logger.error(error)
            throw new Error(`an error occurs with file ${file}`)
        }
    }

    processCSVData (){
        try {
            //detecting "data model"
            const inputDataModel = {}
            this._parsedInfo.fields.reduce((model, field)=>{
                model[field] = this.getFieldType(field)
                return model
            }, inputDataModel)

            this.inputDataModel = inputDataModel
            logger.info(`detected data input data model : ${JSON.stringify(this.inputDataModel)}`)
            fs.writeFileSync('./input/model.json',JSON.stringify(this.inputDataModel))
            logger.info(`expected data model : ${JSON.stringify(this.expectedDataModel)}`)
        
            //for first time we're just adding only link for our parts, but i expect another fields to be added in future.
            
            const missingFields = Object.keys(this.expectedDataModel).filter(
                (field) => !Object.keys(this.inputDataModel).includes(field)
            )
            logger.info(`detected missing field(s) ${missingFields}`)
            return this.processMissingData(missingFields, this.parsedFile)

        } catch (error) {
            logger.error(error)
            throw new Error(error)
        }

    }
    
    //here i plan add more fields in every object in parsed data array
    processMissingData (targetFields, parsedDataArray) {
        if (targetFields.length == 0){
            logger.error("Error with missing data object")
        }
        logger.info(`Processing of missing data started`)
        
        const request = new DataResolver();
        
        const result = parsedDataArray.map((object) => {
            for (let field of targetFields) {
                const id = object["LCSC Part Number"]
                logger.info(`Checking field: ${field} with value: ${id}`)
                if (field === "LCSC Link") {
                    object[field] = request.createPartLinkByID(id)
                    logger.info(`LCSC Link set to: ${object[field]}`)
                } else {
                    object[field] = null
                }
            }
            return object
        })
        return result;
    }
    

    //definition of data types
    getFieldType(field) {
        if (field.includes('Qty.')) {
            return 0;
        } else if (field.includes('Price') || field.includes('€')) {
            return 0.0;
        } else if (field.includes('RoHS')) {
            return true;
        } else {
            return '';
        }
    }

}

const boost = new Enricher()
const connection = await boost.connect()
boost.baseUrl = connection[0]
boost.token = connection[1]

const api = new RequestHandler(boost.baseUrl, boost.token)
const resolver = new DataResolver(api)



boost.readCSV('./input/example.csv')
const enrichedData = boost.processCSVData()
logger.info(`UPDATED objects after processCSVData : ${JSON.stringify(enrichedData, null, 2)}`)


async function getCurrentCategories() {
    const categories = await resolver.getCategories()
    return categories
}    
try {
    let allCategories = await getCurrentCategories()
    logger.logging(`Got all categories: ${allCategories}`)
} catch (error) {
    logger.error(error)
}




