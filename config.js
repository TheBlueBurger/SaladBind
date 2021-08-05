const fs = require("fs");

class Config {
    constructor() {
        this.path = "./data/config.json";
        if (!fs.existsSync(this.path)) fs.writeFileSync(this.path, JSON.stringify({}))
    }
    get(property) {
        const rawData = fs.readFileSync(this.path);
        const data = JSON.parse(rawData);
        return data[property];
    }
    set(property, value) {
        const data = this.getAll();
        data[property] = value;
        fs.writeFileSync(this.path, JSON.stringify(data))
    }
    getAll() {
            const rawData = fs.readFileSync(this.path);
            const data = JSON.parse(rawData);
            return data;
    }
}

module.exports = new Config()