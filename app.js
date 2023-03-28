
let categories = [];

/*Takes non-random categories, randomizes them, 
 * ensures they have at least 5 clues, then returns 
 * the first 6 matching those criteria
 */
function createRandCategories (nonRandCategories) {
    const randCategories = shuffleArray(nonRandCategories);
    const has5CluesArr = randCategories.filter(cat => cat.clues_count >= 5);
    return has5CluesArr.splice(0,6);
}

/* Displays loading view, requests category data from
 * the API, calls createRandCategories,
 * returns 6 random category IDs
 */
async function getCategoryIds() {
    showLoadingView();
    const categoryIds = [];
    const response = await axios.get('https://jservice.io/api/categories?count=100');
    const nonRandCategories = response.data;
    const first6RandCategories = createRandCategories(nonRandCategories);

    for (let cat of first6RandCategories) {
        categoryIds.push(cat['id']);
    }
    return categoryIds;
}

/* Accepts a category ID, makes request to API, 
 * returns the data for that category
 */
async function getCategory(catId) {
    const category = await axios.get(`https://jservice.io/ap` + 
    `i/category?id=${catId}`)
    return category.data;
}

/* Fills the HTML table #jeopardy with a tHead for categories & tBody 
 * cells for questions, adding classes for tBody TDs of x and y 
 * coordinates, for reference use later on.
 */
async function fillTable() {
    const jeopardyTable = document.createElement('table');
    jeopardyTable.id = 'jeopardy';
    document.body.append(jeopardyTable);

    const tHead = document.createElement('thead');

    const headTr = document.createElement('tr');
    tHead.append(headTr);
    
    for (let cat of categories) {
        const newCatName = document.createElement('td');
        newCatName.innerText = cat['title'].toUpperCase();
        headTr.append(newCatName);
    }

    jeopardyTable.append(tHead);

    for (let y = 0; y <= 4; y++) {
        const newTr = document.createElement('tr');
        newTr.classList.add(`row${y}`);
        jeopardyTable.append(newTr);

        for (let x = 0; x <= 5; x++) {
            const newTd = document.createElement('td');
            newTd.innerText = '?';
            newTd.id = `${x}-${y}`;
            newTd.classList.add('clue');
            newTd.addEventListener('click', handleClick);
            newTr.append(newTd);
        }
    }
}

/* Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
    const cell = evt.target;
    const catNum = cell.id[0];
    const clueNum = cell.id[2];

    if (cell.showing === 'question') {
        cell.innerText = categories[catNum].clues[clueNum].answer;
        cell.style.backgroundColor = "#0f7e0f"; // green
        cell.showing = 'answer';
    }
    else if (cell.showing === 'answer') {
        return;
    }
    else {
        cell.innerText = categories[catNum].clues[clueNum].question;
        cell.style.backgroundColor = "#a75a17"; // orange
        cell.showing = 'question';
    }
}

/* Shows spinning wheel to signify game is loading */
function showLoadingView() {
    document.querySelector('.loader').style.display = 'block';
    document.querySelector('button').innerText = 'Loading...';
    }

/* Removes the loading spinner */
function hideLoadingView() {
    document.querySelector('button').innerText = 'Restart!'
    document.querySelector('.loader').style.display = 'none';
}

/* Starts game:
 * Calls getCategoryIds to get 6 random category IDs,
 * calls getCategory() on each of those and pushes them
 * to categories array, removes loading spinner, and fills table
 */
async function setupAndStart() {
    const randCategories = await getCategoryIds();

    for (let cat of randCategories) {
        categories.push( await getCategory(cat));
    };

    hideLoadingView();
    fillTable();
}

/* When DOM content loaded, add event listener to button to
 * start or restart game 
 */
document.addEventListener("DOMContentLoaded", (evt) => {
    const button = document.querySelector('button');
    button.addEventListener('click', function () {
        if (button.innerText === 'Start!') {
            setupAndStart();
        }
        else {
            document.querySelector('table').remove();
            categories = [];
            setupAndStart();
        }
    })
})

