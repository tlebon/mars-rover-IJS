// TODO: change store to Map, updated updateStore Function
let store = Immutable.Map({
	user: Immutable.Map({ name: 'Student' }),
	rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
	roverData: 'bloop',
	activeRover: '',
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
	store = store.merge(newState);
	render(root, store);
};

const render = async (root, state) => {
	root.innerHTML = App(state);
};

// create content
const App = (state) => {
	const rovers = state.get('rovers');
	// add content, add tabs which change rover
	return `
        <header></header>
        <main>
            ${Greeting(store.get('user').get('name'))}
            <section>
            <p>This is a dashboard for the mars rovers, please choose one to see some photos and information</p>
                ${Tabs(rovers)}
                ${Tab(state)}
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
const Tabs = (rovers) => {
	let tabs = rovers
		.map(
			(rover) =>
				`<button onclick="changeRover('${rover}')">${rover}</button>`
		)
		.join(' ');
	return `<div class="tabs">${tabs}</div>`;
};

const Tab = (store) => {
	let activeRover = store.get('activeRover');
	console.log(store);
	const attrs = Immutable.List(['landing_date', 'launch_date', 'status']);
	
	if (activeRover) {
		let roverData = store.get('roverData');
		let rover = roverData.get(activeRover);
		const randomPhoto = Math.floor(Math.random() * rover.photos.length);

		return `<div class="rover">
        <h2>${rover.name}</h2>

        <img onclick="changeRover('${rover.name}')"src="${
			rover.photos[randomPhoto].img_src
		}" height="350px" width="100%" />
        
        ${solChecker(rover, randomPhoto)}
        <div> Want a random day for this rover? 
        Click <button onclick="changeDay('${rover.name}')"> HERE </button>
        </div>
  
        <h3>Rover Info:</h3>
        ${listItems(attrs, rover)}
        </div>`;
	} else return '';
};

// ------------------------------------------------------ Utilities

const santizeItem = (key) =>
	key.charAt(0).toUpperCase() + key.slice(1).split('_').join(' ');

const listItems = (attrs, rover) => {
	let items = attrs
		.map(
			(item) =>
				`<li>${santizeItem(item)}: ${itemFancier(rover[item])}</li>`
		)
		.join('');
	return `<ul>
        ${items}
        </ul>`;
};

const solChecker = (rover, randomPhoto) => {
	if (rover.max_sol === rover.photos[randomPhoto].sol) {
		return `<p>This is a random photo from the most recent day the rover took a picture ${rover.photos[randomPhoto].earth_date}</p>`;
	} else
		return ` <p>This is a random photo from ${rover.photos[randomPhoto].earth_date}</p>`;
};

const isDate = (date) => {
	return new Date(date) !== 'Invalid Date' && !isNaN(new Date(date));
};

const itemFancier = (item) => {
	if (isDate(item)) {
		return `${new Date(item).toDateString()}`;
	} else return santizeItem(item);
};
// ------------------------------------------------------ Interaction

const changeRover = (rover) => {
	updateStore(store, Immutable.Map({ activeRover: rover }));
};

// ------------------------------------------------------  API CALLS

const getRover = (rover) => {
	let roverData = fetch(`http://localhost:3000/rover-data/${rover}`)
		.then((res) => res.json())
		.then((data) => ({
			[rover]: data,
		}));
	return roverData;
};

const createRovers = (state) => {
	const rovers = state.get('rovers');
	Promise.all(rovers.map(getRover))
		.then((data) =>
			data.reduce((obj, curr) => obj.merge(curr), Immutable.Map({}))
		)
		.then((data) => updateStore(store, Immutable.Map({ roverData: data })));
};

// ------------------------------------------------------ BONUS RANDOM DAY

const changeDay = (rover) => {
	fetch(`http://localhost:3000/rover-photos/${rover}`)
		.then((res) => res.json())
		.then((data) =>
			updateStore(store, Immutable.Map{
				roverData: { ...store.roverData, [rover]: data },
			})
		);
};
