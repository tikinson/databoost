// I expect that data resolver class stands for preparing enriched data to
// be consumed by inventree api. Categorization of parts, decision about 
// creating new part/updating qty of existing part, and related stuff.

class DataResolver {

    // when our data was enriched and needs to be used as data for requests
    // i expect to check is it valid supplier (or manufacturer?) in our 
    // Inventree instance
    
    constructor(requestHandler = null) {
        this.api = requestHandler
    }

    //i found a symply way to create a link for part with LCSC Number
	createPartLinkByID (id) {
		return `https://www.lcsc.com/product-detail/${id}.html`
	}

    // Definition for main categories, could be specified by subcategories
    createCategoryByDescription (description) {
        let category
        switch (description.toUpperCase()) {

            case description.includes('SWITCH') || description.includes('SWITCHES'):
                category = 'Switch'
                break
            case description.includes('BUTTON') || description.includes('PUSHBUTTON'):
                category = 'Button'
                break

            default:
                category = NaN
                break
        }
        return category
    }

    // Definition by package, pretty straightforward... maybe will change in futurel
    createCategoryByPackage (partPackage) {
        let category
        switch (partPackage) {
            case 'Plugin':
                category = 'THT'
                break;
        
            default:
                category = partPackage
                break;
        }
        return category
    }

    async getCategories() {
        return await this.api.get('/api/part/category/')
    }

}

export { DataResolver }