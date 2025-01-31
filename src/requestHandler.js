import { Logger } from "./logger.js"


class RequestHandler {
	constructor(){
		this.logger = new Logger()
	}

	//i found a symply way to create a link for part with LCSC Number
	createPartLinkByID (id) {
		return `https://www.lcsc.com/product-detail/${id}.html`
	}
}

export { RequestHandler }