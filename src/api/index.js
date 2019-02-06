/*
Docs:
List of stations:https://www.rail.co.il/apiinfo/api/translator/get?lang=ru&callback=myCallback
https://github.com/hasadna/OpenTrainCommunity/wiki/Unofficial-API-Documentation-for-Israel-Railways-API
 */
const axios = require('axios');
const moment = require('moment');

const getTrainsUrl = (
    {fromStation, toStation, date, time}
) => `https://www.rail.co.il/apiinfo/api/Plan/GetRoutes?OId=${fromStation}&TId=${toStation}&Date=${date}&Hour=${time}`;

const allStationsUrl = 'https://www.rail.co.il/apiinfo/api/translator/get?lang=ru';

let allStations;
/*
Simple wrapper for API with axios.
returns the response as is
todo: error handling
Example:
{fromStation:4600,toStation:2100,date:20181108,time:1700}
 */
const getRawDataFromApi = async ({fromStation, toStation, date, time}) => {
  const {data} = await axios.get(getTrainsUrl({fromStation, toStation, date, time}));

  return data;
};

const apiDateTimeToMoment = (apiDateTime) => {
  return moment(apiDateTime, 'DD/MM/YYYY HH:mm:ss');
};

/*
    MVP Train object implementation
 */
const getTrainObjectsFromApi = async (params) => {
  try {
    const {Data: {Routes, Delays, Omasim}} = await getRawDataFromApi(params);

    return Routes.map((route) => {
      const {Trainno, DepartureTime, ArrivalTime, ReservedSeat} = route.Train[0];
      // General Train data
      const trainNumber = parseInt(Trainno);
      const departure = apiDateTimeToMoment(DepartureTime);
      const arrival = apiDateTimeToMoment(ArrivalTime);
      const hasReservedSeat = ReservedSeat;

      // Getting delay for train
      const _delay = Delays.find((d) => parseInt(d.Train) === trainNumber && d.Station === params.fromStation);
      const delay = _delay ? _delay.Min : null;

      // Getting load for train
      const _loadTrain = Omasim.find((o) => o.TrainNumber === trainNumber);
      let load = null;
      if ( _loadTrain ) {
        const _loadStation = _loadTrain.Stations.find((s) =>
          s.StationNumber === parseInt(params.fromStation)
                    && s.Time === departure.format('HH:mm')
        );

        if ( _loadStation ) {
          load = _loadStation.OmesPercent;
        }
      }

      // Constructing output
      return {
        hasReservedSeat,
        departure,
        arrival,
        trainNumber,
        delay,
        load,
      };
    });
  } catch (error) {
    console.log(error);

    return [];
  }
};

// todo add mocks
const getAllStations = async () => {
  if (allStations) {
    return allStations;
  }

  try {
    const {data} = await axios.get(allStationsUrl);

    allStations = data.station;
  } catch (error) {
    allStations = null;
  }

  return allStations;
};

const getTrainsByDate = async (rawDate, {fromStation, toStation}) => {
  const momentDate = moment(rawDate);
  const date = momentDate.format('YYYYMMDD');// 20181108;
  const time = momentDate.format('HHmm');// 1700;

  try {
    const trainObjects = await getTrainObjectsFromApi({fromStation, toStation, date, time});

    return trainObjects.filter((trainObject) => {
      const {departure} = trainObject;

      return departure.isSameOrAfter(momentDate, 'minute');
    });
  } catch (error) {
    return [];
  }
};

module.exports = {getRawDataFromApi, getAllStations, getTrainsByDate, getTrainObjectFromApi: getTrainObjectsFromApi};
