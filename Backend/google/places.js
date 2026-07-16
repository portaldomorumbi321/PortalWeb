const axios = require("axios");

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;


async function buscarFotoLocal(local){

    const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchText",
        {
            textQuery: local
        },
        {
            headers:{
                "Content-Type":"application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask":
                    "places.displayName,places.photos"
            }
        }
    );


    const place = response.data.places?.[0];


    if(!place || !place.photos){
        return null;
    }


    const photoName = place.photos[0].name;


    return `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxHeightPx=800`;

}


module.exports = {
    buscarFotoLocal
};