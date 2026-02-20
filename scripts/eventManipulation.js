// eventManipulation.js - creates and manages event cards in the DOM
import {showSection} from './ui.js';
import { getEvents, saveEvent, STORAGE_KEY } from './storage.js';
import { validateDate, validateDescription, validateDuration, validateTag, validateTitle } from './validators.js';

export function loadEvents() {
    const events = getEvents();
    const grid = document.getElementById('events-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (events.length === 0) {
        emptyState.hidden = false;
        return;
    }
    
    emptyState.hidden = true;
    
    events.forEach(event => {
        const card = createCard(event);
        grid.appendChild(card);
    });
    drawStatisticsGraph();
}

export function createCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-id', event.id);
    
    card.innerHTML = `
        <div class="event-card-image" style="background: ${event.color}; height: 140px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">#${escapeHtml(event.tag)}</span>
        </div>
        <div class="event-card-body">
            <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
            <div class="event-card-data">
                <span><i class="fa-solid fa-calendar" aria-hidden="true"></i> ${escapeHtml(event.date)}</span>
                <span><i class="fa-solid fa-clock" aria-hidden="true"></i> ${escapeHtml(event.duration)}h</span>
                <span><i class="fa-regular fa-calendar-plus fa-spin-pulse" aria-hidden="true"></i>${escapeHtml(event.createdAt)}</span>
                <span>
            </div>
            <p style="margin-top: 0.6rem; font-size: 0.8rem; color: var(--muted); line-height: 1.5;">${escapeHtml(event.description)}</p>
             <div class="event-card-actions" style="margin-top: 0.8rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-ghost btn-sm edit-btn">
                    <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                </button>
                <button class="btn btn-danger btn-outline btn-sm delete-btn">
                    <i class="fa-solid fa-trash" aria-hidden="true"></i> Delete
                </button>
            </div>
        </div>
    `;
    setupCardButtons(card);
    return card;
}

function setupCardButtons(card) {
    const eventId = card.getAttribute('data-id');
    
    card.querySelector('.delete-btn').addEventListener('click', () => {
        const confirmed = confirm('Are you sure you want to delete this event? This cannot be undone.');
        if (!confirmed) return;
        
        deleteEventById(eventId);
        card.remove();
        
        updateStats();
        drawStatisticsGraph();
        setupWeeklyEvents();
        
        const grid = document.getElementById('events-grid');
        const emptyState = document.getElementById('empty-state');
        if (grid.querySelectorAll('.event-card').length === 0) {
            emptyState.hidden = false;
        }
    });
    
    card.querySelector('.edit-btn').addEventListener('click', () => {
        const events = getEvents();
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        prefillFormForEdit(event);
        showSection('create');
    });
}

function deleteEventById(id) {
    const events = getEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function prefillFormForEdit(event) {
    const form = document.getElementById('create-event-form');
    
    form.querySelector('#evt-title').value = event.title;
    form.querySelector('#evt-date').value = event.date;
    form.querySelector('#evt-duration').value = event.duration;
    form.querySelector('#evt-tag').value = event.tag;
    form.querySelector('#evt-description').value = event.description;
    
    form.setAttribute('data-edit-id', event.id);
    
    document.getElementById('submit-form-button').innerHTML = 
        '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Update Event';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function updateStats() {
    const events = getEvents();
    const totalEvents = events.length;
    
    const totalDuration = events.reduce((sum, event) => {
        return sum + parseFloat(event.duration || 0);
    }, 0);

    const avgDuration = totalEvents > 0 ? (totalDuration / totalEvents).toFixed(2) : '0';
    
    const topTag = getTopTag(events);
    const statTotal = document.getElementById('stat-total');
    const statHours = document.getElementById('stat-hours');
    const statTopTag = document.getElementById('stat-top-tag');
    const statAvg = document.getElementById('stat-week');

    // Update dashboard stats
    if (statTotal) statTotal.textContent = totalEvents;
    if (statHours) statHours.textContent = totalDuration + 'h';
    if (statTopTag) statTopTag.textContent = '#' + topTag;
    if (statAvg) statAvg.textContent = avgDuration + 'h';
    
    const statsTotal = document.getElementById('stats-total');
    const statsDuration = document.getElementById('stats-duration');
    
    // Update statistics page stats
    if (statsTotal) statsTotal.textContent = totalEvents;
    if (statsDuration) statsDuration.textContent = totalDuration + 'h';
}

function getTopTag(events) {
    if (events.length === 0) return '—';
    const allTags = events.map(event => event.tag);
    
    let allWords = [];
    allTags.forEach(tag => {
        // Split each tag by hyphens and collect all words
        const words = tag.split('-');
        allWords.push(...words);
    });

    // Remove duplicates
    const uniqueWords = [...new Set(allWords)];
    const words = allWords.join(' ');

    // Count occurrences of each unique word
    let maxCount = 0;
    let topWord = '—';
    
    uniqueWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = words.match(regex);
        const count = matches ? matches.length : 0;

        if (count > maxCount) {
            maxCount = count;
            topWord = word;
        }
    });
    return topWord;
}


export function clearEvents() {
    const cards = document.querySelectorAll('article.event-card');
    cards.forEach(card => card.remove()); // removing all cards from the grid
}

export function sortEvents(orderBy) {
    const grid = document.getElementById('events-grid');
    const events = getEvents();
    switch (orderBy) {

        case 'date-desc':
            const desc_order = events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            desc_order.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
        case 'date-asc':
            const asc_order = events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            asc_order.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
        case 'title-asc':
            const title_asc = events.sort((a, b) => a.title.localeCompare(b.title));
            title_asc.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
        case 'title-desc':
            const title_desc = events.sort((a, b) => b.title.localeCompare(a.title));
            title_desc.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
        case 'duration-asc':
            const duration_asc = events.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
            duration_asc.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
        case 'duration-desc':
            const duration_desc = events.sort((a, b) => parseFloat(b.duration) - parseFloat(a.duration));
            duration_desc.forEach(event => {
                const card = createCard(event);
                grid.appendChild(card);
            });
            break;
    }
}



export function drawStatisticsGraph() {
    const events = getEvents();
    if (events.length === 0) return;
    const eventTags = events.map(event => event.tag);
    
    // Split each tag by hyphens and flatten into one array
    const allWords = eventTags.flatMap(tag => tag.split('-'));
    
    let tagCount = {};
    allWords.forEach(word => { tagCount[word] = (tagCount[word] || 0) + 1; });

    const maxTag = Math.max(...Object.values(tagCount));
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
    let htmlContent = '';
    for(const [tag, count] of sortedTags) {
        htmlContent += `
            <div class="tag-bar-row">
                <span class="tag-bar-label">${escapeHtml(tag)}</span>
                <div class="tag-bar-track">
                    <div class="tag-bar-fill" style="width: ${(count / maxTag) * 100}%"></div>
                </div>
                <span class="tag-bar-count">${count}</span>
            </div>
        `;
    }
    
    document.getElementById('tag-breakdown').innerHTML = htmlContent;
}

export function setupWeeklyEvents() {
    const events = getEvents();
    if (events.length === 0) return;
    const evt_dates = events.map(event => event.date);
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        next7Days.push(date.toLocaleDateString('en-CA')); // format as YYYY-MM-DD
    }

    const frequencyDates = _.countBy(evt_dates, date => next7Days.includes(date) ? date : 'other');
    delete frequencyDates['other']; // remove events that are not in the next 7 days
    const maxFreq = Math.max(...Object.values(frequencyDates), 0);

    const sortedDates = Object.entries(frequencyDates).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    let htmlContent = '';
    for (const [date, count] of sortedDates) {
        htmlContent += `
            <div class="chart-bar-wrap">
                <div class="chart-bar" style="height: ${(count / maxFreq) * 100}%"></div>
                <span class="chart-day">${escapeHtml(new Date(date).toLocaleDateString('en-US', {weekday: 'long'}))}</span>
                <span class="tag-bar-count">${count}</span>
                </div>`;
    }
    document.getElementById('chart-bars').innerHTML = htmlContent;
}


export function exportEvents() {
    const events = getEvents();
    if (events.length === 0) {
        alert('No events to export!');
        return;
    }
    const jsonstr = JSON.stringify(events, null, 2); 
    const file = new Blob([jsonstr], {type: 'application/json'}); 
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(file);

    const date = [new Date().getFullYear(), (new Date().getMonth() + 1).toString().padStart(2, '0'), new Date().getDate().toString().padStart(2, '0')].join('-');
    link.download = `campus-events-${date}.json`; // filename with current date for better organization
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // clean up the URL object from the memory
}


function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]); 
}

export function importEvents(file) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        try {
            const importedEvents = JSON.parse(fileContent);
            if (!Array.isArray(importedEvents)) {
                alert('Invalid file format: Expected an array of events.');
                return;
            }
            
            let numberOfEvents = 0;
            let errorMessages = [];
            
            const expectedKeys = ['title', 'date', 'duration', 'tag', 'description'];
            
            for (const event of importedEvents) {
                // Check if keys match
                if (!compareArrays(Object.keys(event), expectedKeys)) { 
                    errorMessages.push(`Event with title "${event.title || 'N/A'}" has invalid keys.`);
                    continue;
                }
                
                // Validate each field
                const isTitleValid = validateTitle(event.title);
                const isDateValid = validateDate(event.date);
                const isDurationValid = validateDuration(event.duration);
                const isTagValid = validateTag(event.tag);
                const isDescriptionValid = validateDescription(event.description);
                
                // Check if all validations pass
                if (isTitleValid && isDateValid && isDurationValid && isTagValid && isDescriptionValid) {
                    // Save and get the complete event with id and color
                    const savedEvent = saveEvent(event);
                    
                    // Create card and add to grid
                    const grid = document.getElementById('events-grid');
                    const emptyState = document.getElementById('empty-state');
                    const card = createCard(savedEvent);
                    
                    emptyState.hidden = true;
                    grid.appendChild(card);
                    
                    numberOfEvents++;
                } else {
                    errorMessages.push(`Event "${event.title || 'N/A'}" failed validation.`);
                }
            }
            
            // Update stats after all events are imported
            updateStats();
            
            // Show results
            if (errorMessages.length > 0) {
                alert(`Imported ${numberOfEvents} events. ${errorMessages.length} errors found. Check console for details.`);
                console.log('Import Errors:', errorMessages);
            } else {
                alert(`${numberOfEvents} events imported successfully!`);
            }
            
        } catch (e) {
            alert('Error parsing JSON: ' + e.message);
        }
    };
    
    reader.readAsText(file);
}