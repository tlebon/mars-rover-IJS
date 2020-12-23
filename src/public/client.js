// const { Map, List } = require('immutable');

// TODO: change store to Map, updated updateStore Function
let store = {
	user: { name: 'Student' },
	rovers: ['Curiosity', 'Opportunity', 'Spirit'],
	roverData: {},
	activeRover: '',
};

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
	store = Object.assign(store, newState);
	render(root, store);
};

const render = async (root, state) => {
	root.innerHTML = App(state);
};

// create content
const App = (state) => {
	let { rovers, apod } = state;
	// add content, add tabs which change rover
	return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
            <p>This is a dashboard for the mars rovers, please choose one to see some photos and information</p>
                ${createTabSelectors(rovers)}
                ${Tabs(state)}
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
	createRovers(store);
	render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
	if (name) {
		return `
            <h1>Mars Rover Dash</h1>
        `;
	}

	return `
        <h1>Hello!</h1>
    `;
};

// ------------------------------------------------------ Tabs
// TODO: add active/selected state
const createTabSelectors = (rovers) => {
	return rovers
		.map(
			(rover) =>
				`<button onclick="changeRover('${rover}')">${rover}</button>`
		)
		.join(' ');
};

const Tabs = (state) => {
	const { roverData, activeRover } = state;

	if (activeRover) {
		return `<div>
        ${Tab(roverData[activeRover])}
        </div>`;
	} else return '';
};

const Tab = (rover) => {
	const attrs = ['landing_date', 'launch_date', 'status'];
	const randomPhoto = Math.floor(Math.random() * rover.photos.length);

	if (rover) {
		return `<div class=${rover.name}>
        <h2>${rover.name}</h2>

        <img onclick="changeRover('${rover.name}')"src="${
			rover.photos[randomPhoto].img_src
		}" height="350px" width="100%" />
        
        ${dateChecker(rover, randomPhoto)}
        <div> Want a random day for this rover? 
        Click <button onclick="changeDay('${rover.name}')"> HERE </button>
        </div>
  
        <h3>Rover Info:</h3>
        <ul>
        ${listItem(attrs, rover)}
        </ul>
        </div>`;
	} else return '';
};

// ------------------------------------------------------ Utilities

const santizeKey = (key) =>
	key.charAt(0).toUpperCase() + key.slice(1).split('_').join(' ');

const listItem = (attrs, rover) =>
	attrs
		.map((item) => `<li>${santizeKey(item)}: ${rover[item]}</li>`)
		.join('');

const dateChecker = (rover, randomPhoto) => {
	if (rover.max_sol === rover.photos[randomPhoto].sol) {
		return `<p>This is a random photo from the most recent day the rover took a picture ${rover.photos[randomPhoto].earth_date}</p>`;
	} else
		return ` <p>This is a random photo from ${rover.photos[randomPhoto].earth_date}</p>`;
};

// ------------------------------------------------------ Interaction

const changeRover = (rover) => {
	updateStore(store, { activeRover: rover });
};

// ------------------------------------------------------  API CALLS

const getRover = (rover) => {
	// let { rovers } = state;

	let roverData = fetch(`http://localhost:3000/rover-data/${rover}`)
		.then((res) => res.json())
		.then((data) => ({
			[rover]: data,
		}));
	return roverData;
};

const createRovers = (state) => {
	const { rovers } = state;
	Promise.all(rovers.map(getRover))
		.then((data) =>
			data.reduce((obj, curr) => Object.assign(obj, curr), {})
		)
		.then((data) => updateStore(store, { roverData: data }));
};

// ------------------------------------------------------ BONUS RANDOM DAY

const changeDay = (rover) => {
	fetch(`http://localhost:3000/rover-photos/${rover}`)
		.then((res) => res.json())
		.then((data) =>
			updateStore(store, {
				roverData: { ...store.roverData, [rover]: data },
			})
		);
};
