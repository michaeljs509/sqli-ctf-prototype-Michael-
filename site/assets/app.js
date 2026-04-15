const STORAGE_KEYS = {
    level1: "securebank-level1-passed",
    level2: "securebank-level2-passed",
};

const FLAG = atob("RkxBR3tTUUxfQllQQVNTX1NVQ0NFU1N9");

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    initializeHints();

    if (page === "level1") {
        initializeLevel1();
        return;
    }

    if (page === "level2") {
        if (!guardPage(STORAGE_KEYS.level1, "index.html")) {
            return;
        }
        initializeLevel2();
        return;
    }

    if (page === "admin") {
        if (!guardPage(STORAGE_KEYS.level2, "index.html")) {
            return;
        }
        initializeAdmin();
    }
});

function initializeHints() {
    const hintButton = document.getElementById("hint-button");
    const hints = Array.from(document.querySelectorAll("[data-hint]"));
    let nextHintIndex = 0;

    if (!hintButton || hints.length === 0) {
        return;
    }

    hintButton.addEventListener("click", () => {
        if (nextHintIndex < hints.length) {
            hints[nextHintIndex].hidden = false;
            nextHintIndex += 1;
        }

        if (nextHintIndex >= hints.length) {
            hintButton.disabled = true;
            hintButton.textContent = "All hints revealed";
        }
    });
}

function initializeLevel1() {
    resetProgress();

    const form = document.getElementById("challenge-form");
    const errorMessage = document.getElementById("error-message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const username = String(formData.get("username") || "");
        const password = String(formData.get("password") || "");

        if (isLevel1Success(username, password)) {
            localStorage.setItem(STORAGE_KEYS.level1, "true");
            window.location.href = "level2.html";
            return;
        }

        showError(errorMessage, "Invalid credentials. Keep trying...");
    });
}

function initializeLevel2() {
    const form = document.getElementById("challenge-form");
    const errorMessage = document.getElementById("error-message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const username = String(formData.get("username") || "");
        const password = String(formData.get("password") || "");
        const combined = `${username} ${password}`;

        if (/\bor\b/i.test(combined)) {
            showError(errorMessage, "Nice try... I'm filtering that out 😏");
            return;
        }

        if (isLevel2Success(username, password)) {
            localStorage.setItem(STORAGE_KEYS.level2, "true");
            window.location.href = "admin.html";
            return;
        }

        showError(errorMessage, "Still not good enough. Think differently...");
    });
}

function initializeAdmin() {
    const flagElement = document.getElementById("flag");
    const logoutLink = document.getElementById("logout-link");

    flagElement.textContent = FLAG;
    logoutLink.addEventListener("click", () => {
        resetProgress();
    });
}

function guardPage(storageKey, destination) {
    if (localStorage.getItem(storageKey) !== "true") {
        window.location.replace(destination);
        return false;
    }

    return true;
}

function showError(element, message) {
    element.hidden = false;
    element.textContent = message;
}

function resetProgress() {
    localStorage.removeItem(STORAGE_KEYS.level1);
    localStorage.removeItem(STORAGE_KEYS.level2);
}

function isLevel1Success(username, password) {
    const combined = `${username} ${password}`.toLowerCase();
    const hasQuote = combined.includes("'") || combined.includes("\"");
    const hasOr = /\bor\b/.test(combined) || combined.includes("||");
    const hasAlwaysTrueCondition =
        combined.includes("1=1") ||
        combined.includes("'1'='1'") ||
        combined.includes("\"1\"=\"1\"") ||
        combined.includes("'a'='a'");
    const hasComment = combined.includes("--") || combined.includes("#") || combined.includes("/*");

    return hasQuote && hasOr && (hasAlwaysTrueCondition || hasComment);
}

function isLevel2Success(username, password) {
    const normalizedUsername = username.trim().toLowerCase();
    void password;
    return /^admin'\s*(--|#|\/\*)/.test(normalizedUsername);
}
