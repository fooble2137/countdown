class EmbedCountdownApp {
    constructor() {
        this.countdownInterval = null;
        this.targetDate = null;

        this.settings = this.getDefaultSettings();

        this.init();
    }

    init() {
        this.loadFromURL();
        this.applySettings();
        this.startCountdown();
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const decodeValue = (value) => {
            if (!value) {
                return value;
            }
            let decoded = value;
            for (let i = 0; i < 2; i += 1) {
                try {
                    const next = decodeURIComponent(decoded);
                    if (next === decoded) {
                        break;
                    }
                    decoded = next;
                } catch (error) {
                    break;
                }
            }
            return decoded;
        };

        if (urlParams.has("name")) {
            this.settings.name = decodeValue(urlParams.get("name"));
        }

        if (urlParams.has("target")) {
            this.settings.target = decodeValue(urlParams.get("target"));
        }

        if (urlParams.has("bg")) {
            this.settings.backgroundColor = this.normalizeColor(
                urlParams.get("bg"),
                this.settings.backgroundColor
            );
        }

        if (urlParams.has("text")) {
            this.settings.textColor = this.normalizeColor(
                urlParams.get("text"),
                this.settings.textColor
            );
        }

        if (urlParams.has("accent")) {
            this.settings.accentColor = this.normalizeColor(
                urlParams.get("accent"),
                this.settings.accentColor
            );
        }
    }

    applySettings() {
        // Update countdown name
        document.getElementById("countdownName").textContent = this.settings.name;
        document.title = `Fooble Countdown Widget - ${this.settings.name}`;

        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty("--bg-color", this.settings.backgroundColor);
        root.style.setProperty("--text-color", this.settings.textColor);
        root.style.setProperty("--accent-color", this.settings.accentColor);
    }

    startCountdown() {
        // Clear existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.targetDate = new Date(this.settings.target);

        if (Number.isNaN(this.targetDate.getTime())) {
            return;
        }

        // Update immediately
        this.updateCountdown();

        // Update every second
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date();
        const targetDate = this.targetDate || new Date(this.settings.target);
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            this.showFinishedMessage();
            clearInterval(this.countdownInterval);
            return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update display
        this.animateValue("days", days);
        this.animateValue("hours", hours);
        this.animateValue("minutes", minutes);
        this.animateValue("seconds", seconds);
        this.updateTimeLabels({days, hours, minutes, seconds});

        // Hide finished message if showing
        document.getElementById("finishedMessage").style.display = "none";
        document.getElementById("countdownDisplay").style.display = "grid";
    }

    animateValue(elementId, newValue) {
        const element = document.getElementById(elementId);
        const formattedValue = newValue.toString().padStart(2, "0");

        // Simply update the value without animation
        element.textContent = formattedValue;
    }

    showFinishedMessage() {
        document.getElementById("countdownDisplay").style.display = "none";
        document.getElementById("finishedMessage").style.display = "block";

        // Change document title
        document.title = `Fooble Countdown Widget - 🎉 Time's Up!`;
    }

    updateTimeLabels(values) {
        const labelMap = [
            {elementId: "daysLabel", value: values.days},
            {elementId: "hoursLabel", value: values.hours},
            {elementId: "minutesLabel", value: values.minutes},
            {elementId: "secondsLabel", value: values.seconds},
        ];

        labelMap.forEach(({elementId, value}) => {
            const element = document.getElementById(elementId);
            if (!element) {
                return;
            }
            const isSingular = value === 1;
            const nextLabel = isSingular
                ? element.dataset.singular
                : element.dataset.plural;
            if (nextLabel) {
                element.textContent = nextLabel;
            }
        });
    }

    normalizeColor(value, fallback) {
        if (!value) {
            return fallback;
        }
        const cleaned = value.toString().trim().replace("#", "");
        if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
            return fallback;
        }
        return `#${cleaned}`;
    }

    getDefaultSettings() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return {
            name: "Tomorrow",
            target: tomorrow.toISOString(),
            backgroundColor: "#0f0f0f",
            textColor: "#ffffff",
            accentColor: "#1a1a1a",
        };
    }
}

// Initialize the embed app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new EmbedCountdownApp();
});
