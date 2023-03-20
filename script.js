const titles = [
    'Id', 'Name', 'Amount ($)', 'Address', 'Contact Name'
];
const apiUrl = 'https://random-data-api.com/api/v2/users?size=100';
const maxAmount = 100000;
const deals = [];

const spinner = document.querySelector('.spinner-container');
const header = document.querySelector('.header');
const container = document.getElementById('container');
const selectedField = document.getElementById('field-select');
const sortIncreasing = document.getElementById('up-button');
const sortDecreasing = document.getElementById('down-button');
const searchTerm = document.getElementById('search-term');
const selectedPagination = document.getElementById('display-select');
const modalContainer = document.getElementById('modal-container');

let rows = container.querySelectorAll('.row:not(.title):not(.hide)');
let rowsPerPage = 10;
let totalPages = Math.ceil(rows.length / rowsPerPage);
let pagination = document.getElementById('pagination');

const cellWidth = 100 / (titles.length) + "%";
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function getAmount() {
    return Math.round(Math.random() * maxAmount * 100) / 100;
}

function getAddress(address) {
    return address.street_address + ', ' +
        address.city + ', ' +
        address.state + ', ' + 
        address.country + ', ' +
        address.zip_code;
}

function getContactName(data, i) {
    let idx = i ? i - 1 : data.length - 1;
    return data[idx].first_name + ' ' + data[idx].last_name; 
}

function initializePage() {
    //we first create the title row
    let titleRow = document.createElement('div');
    titleRow.classList.add('row', 'title');
    titles.forEach(title => {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerText = title;
        cell.style.width = cellWidth;
        titleRow.appendChild(cell);
    });
    container.appendChild(titleRow);
    
    //we now fill the table with information
    deals.forEach((deal, idx) => {
        let row = document.createElement('div');
        row.classList.add('row', 'draggable');
        titles.forEach(title => {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerText = title === 'Amount ($)' ? formatter.format(deal[title]) : deal[title];
            deal[title];
            cell.style.width = cellWidth;
            cell.title = title === 'Amount ($)' ? formatter.format(deal[title]) : deal[title];
            row.appendChild(cell);
        });
        deal['element'] = row; //we add a reference from the array to the html element
        row.id = idx; //we add a reference from the html element to the array
        row.draggable = true;
        row.addEventListener('click', (e) => {
            fillModalInfo(e.target.parentNode.id);
            modalContainer.classList.remove('hide');
        });
        row.addEventListener('dragstart', () => {
            row.classList.add('dragging');
        });
        row.addEventListener('dragend', e => {
            e.preventDefault();
            const afterRow = getDragAfterRow(e.clientY);
            if(afterRow == null) {
                container.appendChild(row);
            } else {
                container.insertBefore(row, afterRow)
            }
            row.classList.remove('dragging');
        });
        container.appendChild(row);
    });

}

function sortElements(increasing, attribute) {
    if(typeof deals[0][attribute] === 'number') {
        deals.sort((a, b) => increasing ? a[attribute] - b[attribute] : b[attribute] - a[attribute]);
    } else {
        deals.sort((a, b) => increasing ? a[attribute].localeCompare(b[attribute]) : b[attribute].localeCompare(a[attribute]));
    }
    for(let i = deals.length - 1; i > 0; i--) {
        container.insertBefore(deals[i - 1]['element'], deals[i]['element']);
    }
}

function searchTermPresent(term, deal) {
    for(let i = 0; i < titles.length; i++) {
        let searchableField = deal[titles[i]];
        if(typeof searchableField === 'number') {
            searchableField = titles[i] === 'Amount ($)' ?
                formatter.format(searchableField) : 
                searchableField.toString();
        }
        if(searchableField.toLowerCase().includes(term.toLowerCase())) {
            return true;
        }   
    }
    return false;
}

function paginate() {
    //remove previous pagination, if any
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.remove();
    });
    rows = container.querySelectorAll('.row:not(.title):not(.hide)');
    rowsPerPage = parseInt(selectedPagination.value);
    totalPages = Math.ceil(rows.length / rowsPerPage);

    // Create navigation buttons
    for (let i = 1; i <= totalPages; i++) {
        let pageButton = document.createElement('button');
        pageButton.innerHTML = i;
        pageButton.dataset.page = i;
        pageButton.classList.add('page');
        pageButton.addEventListener('click', p => {
            let pageNum = parseInt(p.target.dataset.page);
            showPage(pageNum);
        });
        pagination.appendChild(pageButton);
    }

    // Display the initial page
    showPage(1);
}

function showPage(pageNum) {
    // Calculate the starting and ending indices of the rows to display
    let startIndex = (pageNum - 1) * rowsPerPage;
    let endIndex = Math.min(startIndex + rowsPerPage, rows.length);
  
    // Hide all rows and show only the ones for the current page
    for (var i = 0; i < rows.length; i++) {
        rows[i].classList.add('inactive');
        if (i >= startIndex && i < endIndex) {
            rows[i].classList.remove('inactive');
        }
    }
    
    // Update the active page button
    let pageButtons = document.getElementsByClassName('page');
    for (let i = 0; i < pageButtons.length; i++) {
        if (pageButtons[i].dataset.page == pageNum) {
        pageButtons[i].classList.add('active');
        } else {
        pageButtons[i].classList.remove('active');
        }
    }
}

function fillModalInfo(idx) {
    let element = document.getElementById('modal_name');
    element.innerText = deals[idx]['Name'];
    element = document.getElementById('modal_id');
    element.innerText = 'Id: ' + deals[idx]['Id'];
    element = document.getElementById('modal_address');
    element.innerText = 'Address: ' + deals[idx]['Address'];
    element = document.getElementById('modal_phone');
    element.innerText = 'Telephone: ' + deals[idx]['telephone'];
    element = document.getElementById('modal_email');
    element.innerText = 'Email: ' + deals[idx]['email'];
    element = document.getElementById('modal_employment');
    element.innerText = 'Occupation: ' + deals[idx]['employment'];
    element = document.getElementById('modal_contact');
    element.innerText = 'Contact name: ' + deals[idx]['Contact Name'];
    element = document.getElementById('modal_amount');
    element.innerText = 'Transaction amount: ' + formatter.format(deals[idx]['Amount ($)']);
    element = document.getElementById('modal_cc');
    element.innerText = 'Credit card used for transaction: ' + deals[idx]['credit_card'];
    element = document.getElementById('modal_avatar');
    element.src = deals[idx]['avatar'];
}

function getDragAfterRow(y) {
    const draggableRows = [...container.querySelectorAll('.draggable:not(.dragging)')];
    return draggableRows.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child};
        }
        return closest
    }, {offset: Number.NEGATIVE_INFINITY}).element;
}

fetch(apiUrl)
    .then(response => response.json())
    .then(json => {
        json.forEach((e, i) => {
            deals.push({
                'Id': e.id,
                'Name': e.first_name + ' ' + e.last_name,
                'Amount ($)': getAmount(),
                'Address': getAddress(e.address),
                'Contact Name': getContactName(json, i),
                'avatar': e.avatar,
                'telephone': e.phone_number,
                'email': e.email,
                'employment': e.employment.title,
                'credit_card': e.credit_card.cc_number
            })
        })
        initializePage();
        paginate();
        header.classList.remove('hide');
        spinner.classList.add('hide');
    });

sortIncreasing.addEventListener('click', () => {
    sortElements(true, selectedField.value);
    paginate();
});

sortDecreasing.addEventListener('click', () => {
    sortElements(false, selectedField.value);
    paginate();
});

searchTerm.addEventListener('input', () => {
    deals.forEach(deal => {
        deal['element'].classList.remove('hide');
        if(!searchTermPresent(searchTerm.value, deal)) {
            deal['element'].classList.add('hide');
        }
    });
    paginate();
});

selectedPagination.addEventListener('change', () => {
    paginate();
});

modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer || event.target.classList.contains('close-button')) {
      modalContainer.classList.add('hide');
    }
});
