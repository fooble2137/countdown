class EmbedCountdownApp {
  constructor() {
    this.countdownInterval = null;

    // Calculate tomorrow at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    this.settings = {
      name: "Tomorrow",
      target: tomorrow.toISOString(),
      backgroundColor: "#0f0f0f",
      textColor: "#ffffff",
      accentColor: "#1a1a1a",
    };

    this.init();
  }

  init() {
    this.loadFromURL();
    this.applySettings();
    this.startCountdown();
  }

  loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("name")) {
      this.settings.name = decodeURIComponent(urlParams.get("name"));
    }

    if (urlParams.has("target")) {
      this.settings.target = decodeURIComponent(urlParams.get("target"));
    }

    if (urlParams.has("bg")) {
      this.settings.backgroundColor = "#" + urlParams.get("bg");
    }

    if (urlParams.has("text")) {
      this.settings.textColor = "#" + urlParams.get("text");
    }

    if (urlParams.has("accent")) {
      this.settings.accentColor = "#" + urlParams.get("accent");
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

    // Update immediately
    this.updateCountdown();

    // Update every second
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    const now = new Date();
    const targetDate = new Date(this.settings.target);
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
}

// Initialize the embed app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EmbedCountdownApp();
});
