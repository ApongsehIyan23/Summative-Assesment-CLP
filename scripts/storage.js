// storage.js - handles saving and loading events from localStorage
import { clearEvents } from "./eventManipulation.js";


export const STORAGE_KEY = 'campus_events';

const COLORS = [
    '#1F6F8B', // blue
    '#D4863A', // orange
    '#2E7D52', // green
    '#C0392B', // red
    '#7B3FA0', // purple
    '#1A6B5A', // teal
];

function generateId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function pickRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function saveEvent(eventData) {
    const events = getEvents();
    
    const newEvent = {
        id: generateId(),
        title: eventData.title,
        date: eventData.date,
        duration: eventData.duration,
        tag: eventData.tag,
        description: eventData.description || '',
        color: pickRandomColor(),
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    
    return newEvent;
}

export function getEvents() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function deleteAllEvents() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState.hidden === false) {
        alert('No events to delete!');
        return
    }
    clearEvents(); //remove all cards from the UI
    emptyState.hidden = false; //reveal empty state message
    localStorage.clear(); //clear all events from storage
    alert('All events have been deleted!');
}

export function updateEventById(id, newData) {
    const events = getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return;
    
    events[index] = {
        ...events[index],
        title: newData.title,
        date: newData.date,
        duration: newData.duration,
        tag: newData.tag,
        description: newData.description
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}