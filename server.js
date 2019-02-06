require('dotenv').config();
const port = process.env.PORT;
const token = process.env.BOT_TOKEN;

const {bot} = require('./src/bot');
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.post('/update', (req, res)=>{
    // console.log(util.inspect(req.body, {showHidden: false, depth: null}));
    exec('/var/www/railil/update.sh',
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    res.end("yes");
});
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});
