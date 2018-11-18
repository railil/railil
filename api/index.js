/*
Docs:
List of stations:https://www.rail.co.il/apiinfo/api/translator/get?lang=ru&callback=myCallback
https://github.com/hasadna/OpenTrainCommunity/wiki/Unofficial-API-Documentation-for-Israel-Railways-API
 */
const axios = require('axios');
const moment = require('moment');

const getTrainsUrl = ({ fromStation, toStation, date, time }) => `https://www.rail.co.il/apiinfo/api/Plan/GetRoutes?OId=${fromStation}&TId=${toStation}&Date=${date}&Hour=${time}`;
const getAllStationsUrl = 'https://www.rail.co.il/apiinfo/api/translator/get?lang=ru';

let allStations;
/*
Simple wrapper for API with axios.
returns the response as is
todo: error handling
Example:
{fromStation:4600,toStation:2100,date:20181108,time:1700}
 */
const getRawDataFromApi = async ({ fromStation, toStation, date, time }) => {
    try {
        const { data } = await axios.get(getTrainsUrl({ fromStation, toStation, date, time }));
        return data;
    } catch (e) {
        throw e;
    }
};

const apiDateTimeToMoment = apiDateTime => {
    return moment(apiDateTime, 'DD/MM/YYYY HH:mm:ss');
};

const getAllStations = async () => {
    if (allStations) {
        return allStations;
    }

    try {
        const {data} = await axios.get(getAllStationsUrl);

        allStations = data.station;

    } catch (e) {
        allStations = null;
    }

    return allStations;
};

const getTrainsForNow = async (now, {fromStation, toStation}) => {
    const moment_date = moment(now);
    const date = moment_date.format('YYYYMMDD');//20181108;
    const time = moment_date.format('HHmm');//1700;
    try {
        const { Data: { Routes } } = await getRawDataFromApi({ fromStation, toStation, date, time });
        const filtered = Routes.filter(route => {
            const departureMoment = apiDateTimeToMoment(route.Train[0].DepartureTime);
            return departureMoment.isAfter(moment_date);
        });

        return filtered.map(route => route.Train[0].DepartureTime);
    } catch (e) {
        return [];
    }
};

module.exports = { getRawDataFromApi, getAllStations, getTrainsForNow };
