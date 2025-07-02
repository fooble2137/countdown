class CountdownApp {
  constructor() {
    this.countdownInterval = null;
    this.targetDate = null;

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
    this.setupEventListeners();
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

  setupEventListeners() {
    const shareBtn = document.getElementById("shareBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const shareModal = document.getElementById("shareModal");
    const resetModal = document.getElementById("resetModal");
    const closeModal = document.getElementById("closeModal");
    const closeShareModal = document.getElementById("closeShareModal");
    const closeResetModal = document.getElementById("closeResetModal");
    const saveSettings = document.getElementById("saveSettings");
    const resetSettings = document.getElementById("resetSettings");
    const confirmReset = document.getElementById("confirmReset");
    const cancelReset = document.getElementById("cancelReset");
    const copyShareUrl = document.getElementById("copyShareUrl");

    shareBtn.addEventListener("click", () => this.openShareModal());
    settingsBtn.addEventListener("click", () => this.openSettings());
    closeModal.addEventListener("click", () => this.closeSettings());
    closeShareModal.addEventListener("click", () => this.closeShareModal());
    closeResetModal.addEventListener("click", () => this.closeResetModal());
    saveSettings.addEventListener("click", () => this.saveSettings());
    resetSettings.addEventListener("click", () => this.openResetModal());
    confirmReset.addEventListener("click", () => this.confirmResetSettings());
    cancelReset.addEventListener("click", () => this.closeResetModal());
    copyShareUrl.addEventListener("click", () => this.copyShareUrl());

    // Add embed code copy button
    document
      .getElementById("copyEmbedCode")
      .addEventListener("click", () => this.copyEmbedCode());

    // Add event shortcut listeners
    document.querySelectorAll(".event-shortcut").forEach((button) => {
      button.addEventListener("click", (e) =>
        this.setEventShortcut(e.target.dataset.event)
      );
    });

    // Add listeners to form inputs to update highlighting when changed
    [
      "countdownTitle",
      "targetDate",
      "backgroundColor",
      "textColor",
      "accentColor",
    ].forEach((inputId) => {
      document.getElementById(inputId).addEventListener("input", () => {
        // Delay the highlighting update to allow for the input to be processed
        setTimeout(() => this.updateEventShortcutHighlighting(), 100);
      });
    });

    // Close modals when clicking outside
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        this.closeSettings();
      }
    });

    shareModal.addEventListener("click", (e) => {
      if (e.target === shareModal) {
        this.closeShareModal();
      }
    });

    resetModal.addEventListener("click", (e) => {
      if (e.target === resetModal) {
        this.closeResetModal();
      }
    });

    // Close modals with escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (settingsModal.classList.contains("show")) {
          this.closeSettings();
        }
        if (shareModal.classList.contains("show")) {
          this.closeShareModal();
        }
        if (resetModal.classList.contains("show")) {
          this.closeResetModal();
        }
      }
    });
  }

  openSettings() {
    const modal = document.getElementById("settingsModal");

    // Populate form with current settings
    document.getElementById("countdownTitle").value = this.settings.name;

    // Convert the stored ISO date back to local time for the datetime-local input
    const targetDate = new Date(this.settings.target);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const hours = String(targetDate.getHours()).padStart(2, "0");
    const minutes = String(targetDate.getMinutes()).padStart(2, "0");
    const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

    document.getElementById("targetDate").value = localDateTimeString;
    document.getElementById("backgroundColor").value =
      this.settings.backgroundColor;
    document.getElementById("textColor").value = this.settings.textColor;
    document.getElementById("accentColor").value = this.settings.accentColor;

    // Update event shortcut highlighting
    this.updateEventShortcutHighlighting();

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  closeSettings() {
    const modal = document.getElementById("settingsModal");
    modal.classList.add("closing");
    setTimeout(() => {
      modal.classList.remove("show", "closing");
      document.body.style.overflow = "";
    }, 300);
  }

  openShareModal() {
    const modal = document.getElementById("shareModal");
    const shareUrl = this.generateShareURL();
    const embedCode = this.generateEmbedCode();

    document.getElementById("shareUrlOutput").value = shareUrl;
    document.getElementById("embedCode").value = embedCode;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  closeShareModal() {
    const modal = document.getElementById("shareModal");
    modal.classList.add("closing");
    setTimeout(() => {
      modal.classList.remove("show", "closing");
      document.body.style.overflow = "";
    }, 300);
  }

  openResetModal() {
    const modal = document.getElementById("resetModal");
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  closeResetModal() {
    const modal = document.getElementById("resetModal");
    modal.classList.add("closing");
    setTimeout(() => {
      modal.classList.remove("show", "closing");
      document.body.style.overflow = "";
    }, 300);
  }

  saveSettings() {
    // Get form values
    const name = document.getElementById("countdownTitle").value || "Countdown";
    const targetDate = document.getElementById("targetDate").value;
    const backgroundColor = document.getElementById("backgroundColor").value;
    const textColor = document.getElementById("textColor").value;
    const accentColor = document.getElementById("accentColor").value;

    if (!targetDate) {
      alert("Please select a target date and time.");
      return;
    }

    // Store the target date as entered (don't convert to local timezone)
    const targetISO = new Date(targetDate).toISOString();

    // Update settings
    this.settings = {
      name,
      target: targetISO,
      backgroundColor,
      textColor,
      accentColor,
    };

    // Apply new settings
    this.applySettings();
    this.startCountdown();

    // Update browser URL
    this.updateBrowserURL();

    // Close modal
    this.closeSettings();
  }

  confirmResetSettings() {
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

    this.applySettings();
    this.startCountdown();
    this.closeResetModal();
    this.closeSettings();

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  generateShareURL() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    params.set("name", encodeURIComponent(this.settings.name));
    params.set("target", encodeURIComponent(this.settings.target));
    params.set("bg", this.settings.backgroundColor.replace("#", ""));
    params.set("text", this.settings.textColor.replace("#", ""));
    params.set("accent", this.settings.accentColor.replace("#", ""));

    return `${baseUrl}?${params.toString()}`;
  }

  generateEmbedCode() {
    const baseUrl = window.location.origin + window.location.pathname;
    const embedUrl = baseUrl
      .replace("index.html", "embed.html")
      .replace(/\/$/, "/embed.html");
    const params = new URLSearchParams();

    if (!embedUrl.endsWith("/embed.html") && !embedUrl.endsWith("/embed/")) {
      embedUrl += "/embed.html";
    }

    params.set("name", encodeURIComponent(this.settings.name));
    params.set("target", encodeURIComponent(this.settings.target));
    params.set("bg", this.settings.backgroundColor.replace("#", ""));
    params.set("text", this.settings.textColor.replace("#", ""));
    params.set("accent", this.settings.accentColor.replace("#", ""));

    const fullEmbedUrl = `${embedUrl}?${params.toString()}`;

    const embedHtml = `<!-- Fooble Countdown Widget -->
<iframe 
  src="${fullEmbedUrl}" 
  width="100%" 
  height="400" 
  frameborder="0" 
  style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
  title="${this.settings.name}">
</iframe>
<!-- End Fooble Countdown Widget -->`;

    return embedHtml;
  }

  updateBrowserURL() {
    const fullUrl = this.generateShareURL();
    window.history.replaceState({}, document.title, fullUrl);
  }

  copyShareUrl() {
    const urlOutput = document.getElementById("shareUrlOutput");
    urlOutput.select();
    urlOutput.setSelectionRange(0, 99999); // For mobile devices

    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlOutput.value).then(() => {
        const copyBtn = document.getElementById("copyShareUrl");
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
        copyBtn.style.background = "#28a745";

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = "";
        }, 2000);
      });
    }
  }

  copyEmbedCode() {
    const embedOutput = document.getElementById("embedCode");
    embedOutput.select();
    embedOutput.setSelectionRange(0, 99999); // For mobile devices

    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedOutput.value).then(() => {
        const copyBtn = document.getElementById("copyEmbedCode");
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
        copyBtn.style.background = "#28a745";

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = "";
        }, 2000);
      });
    }
  }

  setEventShortcut(eventType) {
    const eventData = this.getEventData(eventType);

    // Update form fields
    document.getElementById("countdownTitle").value = eventData.name;
    document.getElementById("targetDate").value = eventData.dateString;
    document.getElementById("backgroundColor").value =
      eventData.colors.background;
    document.getElementById("textColor").value = eventData.colors.text;
    document.getElementById("accentColor").value = eventData.colors.accent;

    // Update highlighting immediately
    document.querySelectorAll(".event-shortcut").forEach((button) => {
      button.classList.remove("active");
    });
    const clickedButton = document.querySelector(`[data-event="${eventType}"]`);
    if (clickedButton) {
      clickedButton.classList.add("active");
    }
  }

  getEventData(eventType) {
    const currentYear = new Date().getFullYear();
    const events = {
      christmas: {
        name: "🎄 Christmas",
        date: new Date(currentYear, 11, 25, 0, 0), // December 25th at midnight
        colors: {
          background: "#0d2818",
          text: "#ffffff",
          accent: "#1a4a32",
        },
      },
      "christmas-eve": {
        name: "🎁 Christmas Eve",
        date: new Date(currentYear, 11, 24, 0, 0), // December 24th at midnight
        colors: {
          background: "#2d1810",
          text: "#ffffff",
          accent: "#4a2f1a",
        },
      },
      "new-year": {
        name: "🎊 New Year",
        date: new Date(currentYear + 1, 0, 1, 0, 0), // January 1st next year at midnight
        colors: {
          background: "#1a1a2e",
          text: "#ffffff",
          accent: "#16213e",
        },
      },
      easter: {
        name: "🐰 Easter",
        date: this.calculateEaster(currentYear),
        colors: {
          background: "#1a2e1a",
          text: "#ffffff",
          accent: "#2a4a2a",
        },
      },
      halloween: {
        name: "🎃 Halloween",
        date: new Date(currentYear, 9, 31, 0, 0), // October 31st at midnight
        colors: {
          background: "#2e1a0a",
          text: "#ffffff",
          accent: "#4a2f15",
        },
      },
    };

    const event = events[eventType];

    // Check if the event date has already passed this year
    if (event.date < new Date() && eventType !== "new-year" && eventType !== "easter") {
      // Move to next year for events that have passed (except New Year which is already next year)
      event.date.setFullYear(currentYear + 1);
    }

    // Recalculate Easter if the event has passed
    if (event.date < new Date() && eventType === "easter") {
      event.date = this.calculateEaster(currentYear + 1);
    }

    // Format date for datetime-local input
    const year = event.date.getFullYear();
    const month = String(event.date.getMonth() + 1).padStart(2, "0");
    const day = String(event.date.getDate()).padStart(2, "0");
    const hours = String(event.date.getHours()).padStart(2, "0");
    const minutes = String(event.date.getMinutes()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}T${hours}:${minutes}`;

    return {
      name: event.name,
      dateString: dateString,
      colors: event.colors,
    };
  }

  calculateEaster(year) {
    // Algorithm to calculate Easter Sunday date
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;

    return new Date(year, n - 1, p + 1, 0, 0); // Easter at midnight
  }

  applySettings() {
    // Update countdown name
    document.getElementById("countdownName").textContent = this.settings.name;
    document.title = `Fooble Countdown - ${this.settings.name}`;

    // Update end time display
    this.updateEndTimeDisplay();

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

    // Optional: Add confetti or other celebration effects here
    this.celebrate();
  }

  celebrate() {
    // Simple celebration animation
    const finishedMessage = document.getElementById("finishedMessage");
    finishedMessage.style.animation = "none";
    finishedMessage.offsetHeight; // Trigger reflow
    finishedMessage.style.animation =
      "pulse 1s infinite, glow 2s ease-in-out infinite alternate";

    // Change document title
    document.title = "Fooble Countdown - 🎉 Time's Up!";
  }

  updateEventShortcutHighlighting() {
    // Remove active class from all shortcuts
    document.querySelectorAll(".event-shortcut").forEach((button) => {
      button.classList.remove("active");
    });

    // Check if current settings match any event shortcut
    const matchingEvent = this.findMatchingEventShortcut();
    if (matchingEvent) {
      const button = document.querySelector(`[data-event="${matchingEvent}"]`);
      if (button) {
        button.classList.add("active");
      }
    }
  }

  findMatchingEventShortcut() {
    const eventTypes = [
      "christmas",
      "christmas-eve",
      "new-year",
      "easter",
      "halloween",
    ];

    for (const eventType of eventTypes) {
      const eventData = this.getEventData(eventType);

      // Check if name matches (allowing for some flexibility)
      const nameMatches =
        this.settings.name === eventData.name ||
        this.settings.name ===
          eventData.name.replace(/🎄|🎁|🎊|🐰|🎃/g, "").trim();

      // Check if colors match
      const colorsMatch =
        this.settings.backgroundColor === eventData.colors.background &&
        this.settings.textColor === eventData.colors.text &&
        this.settings.accentColor === eventData.colors.accent;

      // Check if date matches (within 1 hour tolerance for minor differences)
      const targetDate = new Date(this.settings.target);
      const eventDate = new Date(eventData.dateString);
      const timeDifference = Math.abs(
        targetDate.getTime() - eventDate.getTime()
      );
      const dateMatches = timeDifference <= 3600000; // 1 hour in milliseconds

      if (nameMatches && colorsMatch && dateMatches) {
        return eventType;
      }
    }

    return null;
  }

  updateEndTimeDisplay() {
    const targetDate = new Date(this.settings.target);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    };

    // Date Format: DD.MMM.YYYY, HH:MM (24 hozur format)
    const formattedDate = targetDate.toLocaleDateString("en-US", options);
    const endTimeElement = document.getElementById("endTimeDisplay");
    endTimeElement.textContent = `Ends on ${formattedDate}`;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CountdownApp();
});

// Handle visibility change to pause/resume when tab is not active
document.addEventListener("visibilitychange", () => {
  if (window.countdownApp) {
    if (document.hidden) {
      // Tab is hidden, could pause here if needed
    } else {
      // Tab is visible again, ensure countdown is accurate
      window.countdownApp.updateCountdown();
    }
  }
});
