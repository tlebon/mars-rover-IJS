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
	const { rovers } = store;

	return `
	<header>
	<h1 class="title">Mars Rover Dash</h1>
	</header>
	<main>
            <section>
			${Tabs(rovers)}
			${Tab(state, createGrid)}
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
// I elected to include my BE call here, so that all data is loaded before the page displays.
// Like a useEffect/componentDidMount
window.addEventListener('load', () => {
	createRovers(store).then((store) => render(root, store));
});

// ------------------------------------------------------ Tabs

const createGrid = (arr) => {
	return arr
		.filter((_, index) => (index > 8 ? false : true))
		.map((item) => `<img class="image" src="${item.img_src}"  />`)
		.join('');
};

/**
 * Tabs creates the interactive component at the top of the page for displaying
 * the rovers names from the store.
 * @param {string[]} rovers
 */
const Tabs = (rovers) => {
	let tabs = rovers
		.map(
			(rover) =>
				`<button id="${rover}-button"onclick="changeRover('${rover}')">${rover}</button>`
		)
		.join(' ');
	return `<div class="tabs">${tabs}</div>`;
};
/**
 * Tab takes in the whole store object as a param
 * and displays the main visual component for the page.
 * Based on which rover is active, a different one will be rendered.
 * If none is selected we will see the instructions instead.
 * @param {object} store
 */
const Tab = (store, display) => {
	const { roverData, activeRover } = store;
	const attrs = Immutable.List(['landing_date', 'launch_date', 'status']);

	if (activeRover) {
		const rover = roverData[activeRover];
		const randomPhoto = randomValue(rover.photos.length);

		return `<div id="tab">
        <h2 class="tab-title">${rover.name}</h2>

		<div class ="tab-piece images">
		${display(rover.photos)} 
		</div>

		<div class="tab-piece">
        	<h3 class="tab-info">Rover Info</h3>
			<div id="rover-info"> 
        	${listItems(attrs, rover)}
			${solChecker(rover, randomPhoto)}
			Want a new photo? Click on the image. <br>
			Want a random day for this rover? 
        	Click <button id="random-button" onclick="changeDay('${rover.name}',${
			rover.max_sol
		})"> HERE </button>
		</div>	
  	</div>
</div>`;
	} else return '<p> Please select a rover to see its info</p>';
};

// ------------------------------------------------------ Utilities
/**
 * sanitizeItem takes in a string and capitalizes it and replaces '_' with spaces,
 * if that occurs.
 * @param {string} key
 */
const santizeItem = (key) =>
	key.charAt(0).toUpperCase() + key.slice(1).split('_').join(' ');
/**
 * listItems takes in the active rover object and creates a list item for the tab for each attribute.
 * @param {string[]} attrs
 * @param {object} rover
 */
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

/**
 * solChecker checks if the current sol is the max_sol for the rover and displays a different text if it is.
 * @param {object} rover
 * @param {number} randomPhoto
 */
const solChecker = (rover, randomPhoto) => {
	if (rover.max_sol === rover.photos[randomPhoto].sol) {
		return `<p>This is a random photo from the most recent day the rover took a picture: ${rover.photos[randomPhoto].earth_date}</p>`;
	} else
		return ` <p>This is a random photo from ${rover.photos[randomPhoto].earth_date}</p>`;
};
/**
 * Just a simple date checker function so I could style the date attribute.
 * @param {string} date
 */
const isDate = (date) => {
	return new Date(date) !== 'Invalid Date' && !isNaN(new Date(date));
};
/**
 * takes in a string, checks if its a date, and returns a prettier date or text depending.
 * @param {string} item
 */
const itemFancier = (item) => {
	if (isDate(item)) {
		return `${new Date(item).toDateString()}`;
	} else return santizeItem(item);
};
/**
 * Function to return random values for different situations.
 * @param {number} value
 */
const randomValue = (value) => Math.floor(Math.random() * value);
// ------------------------------------------------------ Interaction
/**
 * This is for the user interaction on the page.
 * Takes in the rover and updates the active rover in the store.
 * The old Rover is also updated, for styling.
 * @param {string} rover
 */
const changeRover = (rover) => {
	let oldRover = store.activeRover;
	updateStore(store, { oldRover: oldRover, activeRover: rover });
	updateRover();
};
/**
 * updates the styling for the active rover, so that the tabs function correctly on user interaction.
 */
const updateRover = () => {
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

/**
 * Calls the backend route to get a single rover based on the string provided.
 * the output data will be an object with the rovers name as the key.
 * @param {string} rover
 */
const getRover = (rover) => {
	let roverData = fetch(`http://localhost:3000/rover-data/${rover}`)
		.then((res) => res.json())
		.then((data) => ({
			[rover]: data,
		}))
		.catch((err) => console.log(err));
	return roverData;
};
/**
 * This function joins together all of the rover calls in one promise.all.
 * This way the output is a single array of objects,
 * which can then be reduced into one update for the store.
 * @param {object} state
 */
const createRovers = (state) => {
	const { rovers } = state;
	return Promise.all(rovers.map(getRover))
		.then((data) =>
			data.reduce((obj, curr) => Object.assign(obj, curr), {})
		)
		.then((data) => updateStore(store, { roverData: data }))
		.catch((err) => console.log(err));
};

// ------------------------------------------------------ BONUS RANDOM DAY
/**
 * looking at the older rovers I realized the most recent photos are a bit lame so I wanted to include an option to switch to a random day
 * for more photo options.
 * @param {string} rover
 */
const changeDay = (rover, maxSol) => {
	const randomSol = randomValue(maxSol);
	fetch(`http://localhost:3000/rover-data/${rover}/${randomSol}`)
		.then((res) => res.json())
		.then((data) =>
			updateStore(store, {
				roverData: { ...store.roverData, [rover]: data },
			})
		)
		.catch((err) => console.log(err));
};
