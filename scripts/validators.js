export function isSafe(input) {
    const pattern = /^(?!.*[<>"`]).*$/s;
    return pattern.test(input);
}

export function validateTitle(title) {
    if (!isSafe(title)) return false;
    const pattern = /^\S(?:.*\S)?$/;
    return pattern.test(title);
}

export function validateDate(date) {
    if (!isSafe(date)) return false;
    const pattern = /^(202[0-9]|203[0-9]|2040)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return pattern.test(date);
}

export function validateDuration(duration) {
    if (!isSafe(duration)) return false;
    const pattern = /^(?:100|[1-9]?[0-9])(\.\d{1,2})?$/;
    return pattern.test(duration);
}

export function validateTag(tag) {
    if (!isSafe(tag)) return false;
    const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return pattern.test(tag);
}

export function validateDescription(description) {
    if (!isSafe(description)) return false;
    const pattern = /\b(\w+)\s+\1\b/i;
    return !pattern.test(description);
}
export function showFieldError(field, errorEl, successEl, msg) {
    field.classList.add('error');
    field.classList.remove('success');
    if (errorEl)   errorEl.textContent  = msg;
    if (successEl) successEl.textContent = '';
}

export function showFieldSuccess(field, errorEl, successEl, msg) {
    field.classList.remove('error');
    field.classList.add('success');
    if (errorEl)   errorEl.textContent  = '';
    if (successEl) successEl.textContent = msg;
}

export function clearFieldState(field, errorEl, successEl) {
    field.classList.remove('error', 'success');
    if (errorEl)   errorEl.textContent  = '';
    if (successEl) successEl.textContent = '';
}