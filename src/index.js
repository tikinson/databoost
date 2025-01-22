import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

import Logger from './utils/utils.js'

function test() {
    // Читання CSV з файлу
    const inputPath = './input/example.csv'
    if (!fs.existsSync(inputPath)) {
        throw new Error(`no file ${inputPath}`)
    }
    const csvData = fs.readFileSync(inputPath, 'utf8')

    // Парсинг CSV
    const parsedData = Papa.parse(csvData, {
        header: true, // Парсить заголовки як об'єкт
        skipEmptyLines: true, // Пропускає порожні рядки
    });
    console.log('Parsed data:', parsedData.data)
}

// test()

const configPath = path.resolve("./config.json")
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const workingDir = process.cwd()

let initMsg = `main script started with configs: ${JSON.stringify(config)} in directory: ${workingDir}`
//console.log(`main script started with configs: ${JSON.stringify(config)} in directory: ${workingDir}`)

const logger = new Logger()
logger.info(initMsg)




