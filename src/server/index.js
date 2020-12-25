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

// API calls for rover manifest and photos
// grabs the most recent date from manifest and then pull that date from photos.
// I decided to merge the two endpoints into one because I thought it would be better for getting the most recent photos. 
app.get('/rover-data/:rover', async (req, res) => {
	const rover = req.params.rover;
	try {
		let roverData = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		const manifest = roverData.photo_manifest;
		const { max_sol } = manifest;

		let roverPhotos = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${max_sol}&api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		res.send(Object.assign(manifest, roverPhotos));
	} catch (err) {
		console.log('error:', err);
	}
});

// Get photos from a random day.
app.get('/rover-photos/:rover', async (req, res) => {
	const rover = req.params.rover;
	try {
		let roverData = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`
		).then((res) => res.json());
		const manifest = roverData.photo_manifest;
        const { max_sol } = manifest;
        
		const randomDay = Math.floor(Math.random() * max_sol);
		let roverPhotos = await fetch(
			`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${randomDay}&api_key=${process.env.API_KEY}`
        ).then((res) => res.json());

		res.send(Object.assign(manifest, roverPhotos));
	} catch (err) {
		console.log('error:', err);
	}
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
