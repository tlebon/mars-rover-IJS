// const { Map, List } = require('immutable');

// TODO: change store to Map, updated updateStore Function
let store = {
	user: { name: 'Student' },
	apod: '',
	rovers: ['Curiosity', 'Opportunity', 'Spirit'],
	roverData: {},
	activeRover: 'Curiosity',
};

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
	store = Object.assign(store, newState);
	console.log(store);
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
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                ${createTabSelectors(rovers)}
                ${Tabs(state)}
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
	render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
	if (name) {
		return `
            <h1>Welcome, ${name}!</h1>
        `;
	}

	return `
        <h1>Hello!</h1>
    `;
};

// ------------------------------------------------------ Tabs

const createTabSelectors = (rovers) => {
   return rovers.map(
        (rover) =>
            `<button onclick="changeRover('${rover}')">${rover}</button>`
    ).join(' ');
};
const Tabs = (state) => {
	const { rovers, roverData, activeRover } = state;
	if (!roverData[rovers[0]]) {
		createRovers(state);
	}
	return `<div>
    ${Tab(roverData[activeRover])}
    </div>`;
};

const Tab = (rover) => {
	return rover?`<div class=${rover.name}>
    <h2>${rover.name}</h2>
    rover recent photos (carousel?)
    photo date
    rover launch date
    rover landing date
    status
    </div>`: '';
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
