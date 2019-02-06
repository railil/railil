// TODO move api ids to StationService

const db = require('../../db');

// todo: don't mind this method. This is to check that DB connection works
const getUserPreferences = () => {
  return new Promise((resolve) => {
    db.select('*')
        .from('user_preferences')
        .then(resolve);
  });
};

const getToHomeStations = () => {
  const fromStation = 4600; // tel aviv shalom
  const toStation = 2100; // haifa merkaz ha shmona

  return {fromStation, toStation};
};

const getToWorkStations = () => {
  const toStation = 4600; // tel aviv shalom
  const fromStation = 2100; // haifa merkaz ha shmona

  return {fromStation, toStation};
};

module.exports = {
  getToWorkStations,
  getToHomeStations,
  getUserPreferences,
};
