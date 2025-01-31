import fs from 'fs'
import path from 'path'



// I expect that data resolver class stands for preparing enriched data to
// be consumed by inventree api. Categorization of parts, decision about 
// creating new part/updating qty of existing part, and related stuff.



class DataResolver {

    // when our data was enriched and needs to be used as data for requests
    // i expect to check is it valid supplier (or manufacturer?) in our 
    // Inventree instance
    
    constructor(dataOrigin) {
        this.dataOrigin = dataOrigin
    }


}

export { DataResolver }