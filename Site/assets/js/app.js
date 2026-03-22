// Elements
const currentYearElement = document.getElementById("current-year");
const themeToggleButton = document.getElementById("theme-toggle");

// Update the current year in the footer
if (currentYearElement) {
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
}

if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
}

function getTheme() {
    let theme = localStorage.getItem('preferences.theme')?.replaceAll('"', '')?.trim()?.toLowerCase() ?? '';
    if (theme !== 'dark' && theme !== 'light') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('preferences.theme', newTheme);
    document.documentElement.classList.remove(currentTheme);
    document.documentElement.classList.add(newTheme);
}
