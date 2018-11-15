const getToHomeStations = () => {
    const fromStation = 4600; //tel aviv shalom
    const toStation = 2100; //haifa merkaz ha shmona

    return {fromStation, toStation};
};

const getToWorkStations = () => {
    const toStation = 4600; //tel aviv shalom
    const fromStation = 2100; //haifa merkaz ha shmona

    return {fromStation, toStation};
};

module.exports = {
    getToWorkStations,
    getToHomeStations
};
