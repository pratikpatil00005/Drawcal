class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.rootElement = document.documentElement;
        this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    init() {
        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('theme') || 
            (this.darkModeMediaQuery.matches ? 'dark' : 'light');
        
        this.setTheme(savedTheme);
        
        // Add event listeners
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.darkModeMediaQuery.addEventListener('change', (e) => this.handleSystemThemeChange(e));
    }

    setTheme(theme) {
        this.rootElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button icon
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        
        // Optional: update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#1a202c');
        }
    }

    toggleTheme() {
        const currentTheme = this.rootElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    handleSystemThemeChange(e) {
        if (!localStorage.getItem('theme')) {
            this.setTheme(e.matches ? 'dark' : 'light');
        }
    }
}

// Initialize theme manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
