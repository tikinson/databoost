import { Logger } from "./logger.js"

class RequestHandler {
	constructor(baseURL, token){
		this.logger = new Logger()
		this.baseURL = baseURL
		this.token = token
	}

    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`GET ${endpoint} failed: ${response.status}`);
        }

        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${this.token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`POST ${endpoint} failed: ${response.status}`);
        }

        return response.json();
    }
}

export { RequestHandler }