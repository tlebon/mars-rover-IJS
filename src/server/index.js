require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// your API calls

// example API call
app.get('/apod', async (req, res) => {
	try {
		let image = await fetch(
			`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		res.send({ image });
	} catch (err) {
		console.log('error:', err);
	}
});
// API calls for rover manifest and photos
// grabs the most recent date from manifest and then pull that date from photos.
app.get('/rover_data/:rover', async (req, res) => {
	const rover = req.params.rover;
	try {
		let roverData = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		const { max_sol } = roverData;

		let roverPhotos = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${max_sol}&api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		res.send(Object.assign(roverData, roverPhotos));
	} catch (err) {
		console.log('error:', err);
	}
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
