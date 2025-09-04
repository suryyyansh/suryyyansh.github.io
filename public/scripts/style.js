function toggleDarkMode() {
    darkMode = document.getElemen
}

function loadCSS(filename) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = filename;
    link.type = 'text/css';

    // Optional: Add onload/onerror handlers for tracking load status
    link.onload = () => console.log(`${filename} loaded successfully!`);
    link.onerror = () => console.error(`Error loading ${filename}`);

    document.head.appendChild(link);
}

// Example usage:
loadCSS('styles/theme-dark.css');