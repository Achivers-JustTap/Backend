const axios = require('axios');
const captainModel = require('../models/captainsModel');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey ='AIzaSyDA7QxXq1FaHe3W4xLDgCF5XSB6n-RN8TA';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDRWDCH-MCMYS0ohxiCENn4v2NBCw1tZb8`;

    try {
        const response = await axios.get(url);
        console.log("Respnse ",response)
        if (response.data.status === 'OK') {
            const location = response.data.results[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports.getDistanceTime =  async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = 'AIzaSyDA7QxXq1FaHe3W4xLDgCF5XSB6n-RN8TA';

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {


        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
           
        } else {
            throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error(err);
        throw err;
    }

 }

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey ='AIzaSyDA7QxXq1FaHe3W4xLDgCF5XSB6n-RN8TA';
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}`;


    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;


}