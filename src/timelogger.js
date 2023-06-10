/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to add functionality to the timelogger UI.
 */

(function() {
    "use strict";

    // we assume that this value exists, since the user has successfully logged in
    const USERNAME = localStorage.getItem("localUser");

    const homeOpt = ["Log existing activity", "View logged data", "View reports",
            "View logging options", "Add new activity"];

    const timeOpt = ["This 30 minutes", "Last 30 minutes", "Custom time range"];

    const reportOpt = ["Sleep statistics", "Activity statistics"];

    const sleepOpt = ["Bedtime", "Wake time", "Sleep duration", "Sleep goals"];

    async function init() {
        qs("#logout-btn").addEventListener("click", () => localStorage.removeItem("localUser"));
        if (checkUser()) {
            populateHomeButtons();
            printWelcome(USERNAME);
            printPrompt("What would you like to do?");
        }
    }


    /**
     * Checks whether there is a localUser of the TimeLogger app, which should
     * only occur when this page is reached directly from the login page
     * @returns {boolean} - true if there is a logged in user, false otherwise
     */
    function checkUser() {
        if (USERNAME == null) {
            printPrompt("There has been an error. Please log out and log in again.");
            return false;
        }
        return true;
    }


    /**
     * Initialize the page with the main menu options (client user)
     */
    function populateHomeButtons() {
        const menu = qs("#choices");
        menu.innerHTML = "";
        homeOpt.forEach(option => {
            let newBtn = gen("button");
            newBtn.textContent = option;
            newBtn.classList.add("main-menu");
            menu.appendChild(newBtn);
        });
    }

    /**
     * Displays a large message in the prompt area
     * @param {string} msg - message to print
     */
    function printMsg(msg) {
        qs("#large-msg").textContent = msg;
    }

    /**
     * Displays a smaller message in the prompt area
     * @param {string} msg - message to print
     */
    function printPrompt(msg) {
        qs("#prompt").textContent = msg;
    }

    /**
     * Display the welcome message with the client's username
     * @param {string} un - the username, usually USERNAME
     */
    function printWelcome(un) {
        printMsg("Welcome back, ");
        let name = gen("span");
        name.id = "current-user";
        name.textContent = un;
        qs("#large-msg").appendChild(name);
    }

    init();
})();