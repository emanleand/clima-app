
const fs = require('fs');

const axios = require('axios');
class Searchs {

    history = [];
    dbPath = './db/database.json';
    constructor() {
        /* Read data from database */
        this.readDB();
    }

    get historyCapitalize() {
        return this.history.map(place => {
            let letter = place.split(' ');
            letter = letter.map(l => l[0].toUpperCase() + l.substring(1));

            return letter.join(' ');
        })
    }

    get paramsMapBox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async city(place = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapBox
            });
            const resp = await instance.get();

            return resp.data.features.map(place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1],
            }));

        } catch (err) {
            return [];
        }
    }

    async weatherPlaces(lat, lon) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            });

            const resp = await instance.get();
            const { main, weather } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            };

        } catch (err) {
            return [];
        }
    }

    addHistory(place = '') {

        if (this.history.includes(place.toLocaleLowerCase())) {
            return;
        }

        this.history = this.history.splice(0, 5);

        /* prevent duplicated */
        this.history.unshift(place.toLocaleLowerCase());

        /* save in db */
        this.saveDB();
    }

    saveDB() {
        const payload = {
            history: this.history
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    readDB() {
        if (!fs.existsSync(this.dbPath)) {
            return;
        }

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        this.history = data.history;
    }
}

module.exports = Searchs;