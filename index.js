
require('dotenv').config();
const { readInput, pause, inquirerMenu, listPlaces } = require('./helpers/inquirer');
const searchs = require('./models/searchs');

const main = async () => {
    const Searchs = new searchs();
    let opt;

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                const placeSearched = await readInput('place');
                /* search places */
                const places = await Searchs.city(placeSearched);
                /* select city */
                const id = await listPlaces(places);
                /* verified if option is equal to cancelar */
                if (id === '0') continue;
                const placeSelected = places.find(place => place.id === id);
                /* Save history of searched */
                Searchs.addHistory(placeSelected.name);

                /* search weather for place */
                const weather = await Searchs.weatherPlaces(placeSelected.lat, placeSelected.lng);

                console.log('Temperature'.green);
                console.log('City:', placeSelected.name);
                console.log('Lat:', placeSelected.lat);
                console.log('Lng:', placeSelected.lng);
                console.log('Temperature:', weather.temp);
                console.log('Min:', weather.min);
                console.log('Max:', weather.max);
                console.log('Description:', weather.desc);

                break;
            case 2:
                Searchs.historyCapitalize.forEach((place, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${place}`);
                });

                break;
        }

        if (opt !== 0) await pause();

    } while (opt !== 0);
}

main();