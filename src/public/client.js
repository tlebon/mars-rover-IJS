// TODO: change store to Map, updated updateStore Function
let store = {
	user: { name: 'Student' },
	rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
	roverData: null,
	activeRover: '',
	oldRover: '',
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
	let { rovers } = state;

	return `
	<header>
	<h1 class="title">Mars Rover Dash</h1>
	</header>
	<main>
            <section>
			${Tabs(rovers)}
			${Tab(state)}
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
	createRovers(store).then((store) => render(root, store));
});

// ------------------------------------------------------ Tabs

const Tabs = (rovers) => {
	let tabs = rovers
		.map(
			(rover) =>
				`<button id="${rover}-button"onclick="changeRover('${rover}')">${rover}</button>`
		)
		.join(' ');
	return `<div class="tabs">${tabs}</div>`;
};

const Tab = (store) => {
	const { roverData, activeRover } = store;
	const attrs = Immutable.List(['landing_date', 'launch_date', 'status']);

	if (activeRover) {
		const rover = roverData[activeRover];
		const randomPhoto = Math.floor(Math.random() * rover.photos.length);

		return `<div id="tab">
        <h2 class="tab-title">${rover.name}</h2>

        <div class ="tab-piece"> <img onclick="changeRover('${
			rover.name
		}')"src="${
			rover.photos[randomPhoto].img_src
		}" height: "400px" height:"400px"/>
		</div>

		<div class="tab-piece">
        	<h3 class="tab-info">Rover Info</h3>
			<div id="rover-info"> 
        	${listItems(attrs, rover)}
        	${solChecker(rover, randomPhoto)}
			Want a random day for this rover? 
        	Click <button id="random-button" onclick="changeDay('${
				rover.name
			}')"> HERE </button>
		</div>	
  	</div>
</div>`;
	} else return '<p> Please select a rover to see its info</p>';
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
	let oldRover = store.activeRover;
	const tab = document.getElementById(`tab`);
	if (tab) {
		tab.className = 'removing';
	}
	updateStore(store, { oldRover: oldRover, activeRover: rover });
	updateRover(rover);
};

const updateRover = (rover) => {
	const currRover = document.getElementById(`${store.oldRover}-button`);
	const newRover = document.getElementById(`${store.activeRover}-button`);

	if (currRover) {
		currRover.className = '';
	}
	if (currRover == newRover) {
		currRover.className = 'active';
	}
	newRover.className = 'active';
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
		.then((data) => updateStore(store, { roverData: data }))
		.catch((err) => console.log(err));
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
