// I expect that data resolver class stands for preparing enriched data to
// be consumed by inventree api. Categorization of parts, decision about 
// creating new part/updating qty of existing part, and related stuff.

class DataResolver {

    // when our data was enriched and needs to be used as data for requests
    // i expect to check is it valid supplier (or manufacturer?) in our 
    // Inventree instance
    
    constructor(requestHandler = null) {
        this.api = requestHandler
        this.categories
    }

    //i found a symply way to create a link for part with LCSC Number
	createPartLinkByID (id) {
		return `https://www.lcsc.com/product-detail/${id}.html`
	}

    // Definition for main categories, could be specified by subcategories
    initCategoryByDescription(description) {
        let category;
    
        if (/switch(es)?/i.test(description)) {
            category = 'Switch';
        } else if (/button|pushbutton/i.test(description)) {
            category = 'Button';
        } else {
            category = NaN;
        }
        return category;
    }

    // Definition by package, pretty straightforward... maybe will change in futurel
    initCategoryByPackage (partPackage) {
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

    setCategories (categoriesArray) {
        this.categories = categoriesArray
    }

    async handleEnrichedData (data) {
        //console.log(`there is categories : ${}`)

        data.map(async(object)=>{
            // first of all let's check if category created by package is matching every category from server
            // to do so we can create expected category from package or handle some exceptions regards description

            let expectedCategory = this.initCategoryByPackage(object.Package)
            if (expectedCategory === '-' || !expectedCategory) 
                expectedCategory = this.initCategoryByDescription(object.Description)
            console.log("-----> category that we want ot find : ", expectedCategory)

            let matchedCategory = this.categories.filter((cat)=> {cat.name === expectedCategory})
            console.log(matchedCategory);
            
            const categoryExists = this.categories.some((cat)=>{cat.name === expectedCategory})

            console.log("-----> match : ",categoryExists);
            
            if (!categoryExists) {
                const newCategoryObj = {
                    name: expectedCategory,
                    description: object.Description,
                    default_keywords: object.Description,
                    parent: null,
                    structural: true
                }
                const response = await this.api.post('/api/part/category/', newCategoryObj)
                console.log(JSON.stringify(response))
                const updatedCategories = await this.getCategories()
                console.log(`updated categories : ${updatedCategories}`)
            }
            
        })
    }
}

export { DataResolver }