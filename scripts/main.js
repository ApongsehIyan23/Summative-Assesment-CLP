import { showSection } from './ui.js';
import {
    validateTitle, validateDate, validateDuration, validateTag, validateDescription,
    showFieldError, showFieldSuccess, clearFieldState
} from './validators.js';
import { saveEvent, deleteAllEvents, updateEventById } from './storage.js';
import { loadEvents, createCard, updateStats , clearEvents, 
    sortEvents, exportEvents, importEvents, drawStatisticsGraph, setupWeeklyEvents} from './eventManipulation.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('create-event-form');
    
    // Load existing events when page loads
    loadEvents();

    // Update the stats
    updateStats();
    
    // Setup weekly events
    setupWeeklyEvents();

    // get the grid and the empty state
    const grid = document.getElementById('events-grid');
    const emptyState = document.getElementById('empty-state');

    form.addEventListener('input', (e) => {
        const id = e.target.id;
        const value = e.target.value;
        const errorEl = document.getElementById(id + '-error');
        const successEl = document.getElementById(id + '-success');

        if (!value) { 
            clearFieldState(e.target, errorEl, successEl); 
            return; 
        }

        switch (id) {
            case 'evt-title':
                validateTitle(value)
                    ? showFieldSuccess(e.target, errorEl, successEl, '✓ Valid title')
                    : showFieldError(e.target, errorEl, successEl, 'Invalid title — no leading/trailing spaces or < > " ` characters');
                break;

            case 'evt-date':
                validateDate(value)
                    ? showFieldSuccess(e.target, errorEl, successEl, '✓ Valid date')
                    : showFieldError(e.target, errorEl, successEl, 'Invalid date — use YYYY-MM-DD. Month 01–12, Day 01–31');
                break;

            case 'evt-duration':
                validateDuration(value)
                    ? showFieldSuccess(e.target, errorEl, successEl, '✓ Valid duration')
                    : showFieldError(e.target, errorEl, successEl, 'Invalid duration — number between 0 and 100, up to 2 decimal places');
                break;

            case 'evt-tag':
                validateTag(value)
                    ? showFieldSuccess(e.target, errorEl, successEl, '✓ Valid tag')
                    : showFieldError(e.target, errorEl, successEl, 'Invalid tag — letters, spaces, and hyphens only');
                break;

            case 'evt-description':
                validateDescription(value)
                    ? showFieldSuccess(e.target, errorEl, successEl, '✓ Valid description')
                    : showFieldError(e.target, errorEl, successEl, 'Invalid description — duplicate words detected or contains < > " ` characters');
                break;
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const requiredFields = Array.from(form.querySelectorAll('.form-input[required]'));
        const invalidFields = requiredFields.filter(field => !field.classList.contains('success'));

        if (invalidFields.length > 0) {
            invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            alert('Please fix errors in the form before submitting.');
            return;
        }

        const formData = new FormData(this);
        const eventData = Object.fromEntries(formData.entries());
        eventData.tag = eventData.tag.toLowerCase(); //normalize tag to lowercase for consistency
        const editID = form.getAttribute('data-edit-id');

        if (editID) {
            updateEventById(editID, eventData);
            location.reload(); //reload page to reflect changes after editing an event
        }
        else {
            // Save to localStorage and get the saved event with id and color
            const savedEvent = saveEvent(eventData);
        
            // Create the card and add it to the grid
            const card = createCard(savedEvent);
        
            emptyState.hidden = true;
            grid.appendChild(card);
        
            // Update the stats
            updateStats();
            drawStatisticsGraph();
            setupWeeklyEvents();
            // Reset form and go back to dashboard
            document.getElementById('cancel-create').click();
            alert('Event created successfully!');
        }
    });

    document.getElementById('cancel-create').addEventListener('click', () => {
        form.reset();
        form.removeAttribute('data-edit-id');

        document.getElementById('submit-form-button').innerHTML =
            `<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Event`;
        
        Array.from(form.querySelectorAll('.form-input')).forEach(input => {
            const errorEl = document.getElementById(input.id + '-error');
            const successEl = document.getElementById(input.id + '-success');
            clearFieldState(input, errorEl, successEl);
        });
        
        showSection('dashboard');
    });

    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            showSection(sectionId);
            /*
            if (sectionId === 'statistics') drawStatisticsGraph();
            //draw the statistics graph when the user clicks on the statistics section in the sidebar or bottom nav
            */
        });
    });

    document.getElementById('createEvent-button').addEventListener('click', () => {
        showSection('create');
    });

    document.addEventListener('keydown', (key) => {
        if (!key.shiftKey) return;
        switch (key.key.toLowerCase()) {
            case 'w': showSection('create'); break;
            case 's': showSection('statistics'); /** drawStatisticsGraph();*/ break;
            case 'h': showSection('dashboard'); break;
            case 'a': showSection('about'); break;
            case 'x': showSection('settings'); break;
        }
    });

    function triggerImport() {
        document.getElementById('json-import-input').click();
        setupWeeklyEvents(); //refresh weekly events after import
    }

    function triggerExport() {
        if (emptyState.hidden === true) {
                exportEvents();} 
        else {
            alert('Cannot export events when there are no events to export!');
        }
    }

    // Hotkey for importing (Ctrl + I)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            triggerImport();
        }
    });

    // Hotkey for exporting (Alt + X)
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'x') {
            triggerExport();
        }
    });

    // Import button click (both buttons)
    document.getElementById('btn-import').addEventListener('click', triggerImport);
    document.getElementById('import-btn').addEventListener('click', triggerImport);

    // Export button clicks (both buttons)
    document.getElementById('export-btn').addEventListener('click', triggerExport);
    document.getElementById('btn-export').addEventListener('click', triggerExport);

    const jsonFile = document.getElementById('json-import-input');
    jsonFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        importEvents(file);
    });

    //event listener for sort select change to clear events before sorting
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('sort-select')) {
            const sortKey = e.target.value;
            emptyState.hidden === true ? clearEvents() : alert('Cannot sort events when there are no events to sort!'); // clear events to start sorting
            sortEvents(sortKey); // sort events based on selected key
        }
    });

    //event listener for delete all button
    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all events? This action cannot be undone.')) {
            deleteAllEvents();
            location.reload(); //reload page to reset state and show empty dashboard
        }
    });

    //for Searching
    const searchInput = document.getElementById('search-input');
    const caseSensitiveCheckbox = document.getElementById('case-sensitive');

    searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.trim();
    const allCards = document.querySelectorAll('.event-card');
    
    if (allCards.length === 0) {
        searchInput.value = '';
        return;
    }
    
    if (searchText === '') {
        allCards.forEach(card => card.hidden = false);
        return;
    }
    
    const isCaseSensitive = caseSensitiveCheckbox.checked;
    
    allCards.forEach(card => {
        const title = card.querySelector('.event-card-title').textContent;
        const tag = card.querySelector('.event-card-image span').textContent;
        
        const descriptionElement = card.querySelector('p');
        const description = descriptionElement.textContent;
        
        const metaElements = card.querySelectorAll('.event-card-data span');
        const date = metaElements[0].textContent;
        const duration = metaElements[1].textContent;
        
        const cardText = title + ' ' + description + ' ' + date + ' ' + duration + ' ' + tag;
        
        let found = false;
        if (isCaseSensitive) {
            found = cardText.includes(searchText);
        } else {
            found = cardText.toLowerCase().includes(searchText.toLowerCase());
        }
        
        if (found) {
            card.hidden = false;
            highlightText(card, searchText, isCaseSensitive);
        } else {
            card.hidden = true;
        }
    });
});

function highlightText(card, searchText, caseSensitive) {
    const title = card.querySelector('.event-card-title');
    const tag = card.querySelector('.event-card-image span');
    const description = card.querySelector('p');
    const metaElements = card.querySelectorAll('.event-card-data span');
    
    const titleText = title.textContent;
    const tagText = tag.textContent;
    const descText = description ? description.textContent : '';
    const dateText = metaElements[0].textContent;
    const durationText = metaElements[1].textContent;
    
    if (caseSensitive) {
        title.innerHTML = titleText.split(searchText).join(`<mark>${searchText}</mark>`);
        tag.innerHTML = tagText.split(searchText).join(`<mark>${searchText}</mark>`);
        metaElements[0].innerHTML = dateText.split(searchText).join(`<mark>${searchText}</mark>`);
        metaElements[1].innerHTML = durationText.split(searchText).join(`<mark>${searchText}</mark>`);
        if (description) {
            description.innerHTML = descText.split(searchText).join(`<mark>${searchText}</mark>`);
        }
    } else {
        const regex = new RegExp(searchText, 'gi');
        title.innerHTML = titleText.replace(regex, match => `<mark>${match}</mark>`);
        tag.innerHTML = tagText.replace(regex, match => `<mark>${match}</mark>`);
        metaElements[0].innerHTML = dateText.replace(regex, match => `<mark>${match}</mark>`);
        metaElements[1].innerHTML = durationText.replace(regex, match => `<mark>${match}</mark>`);
        if (description) {
            description.innerHTML = descText.replace(regex, match => `<mark>${match}</mark>`);
        }
    }
}
});