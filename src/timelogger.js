/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to add functionality to the timelogger UI.
 */

(function() {
    "use strict";

    // this is constant across one run of the program but needs to be retrieved
    // from the SQL (all caps for convenience)
    let USERNAME = "aileen";

    const homeOpt = ["Log existing activity", "View logged data", "View reports",
            "View logging options", "Add new activity"];

    const timeOpt = ["This 30 minutes", "Last 30 minutes", "Custom time range"];

    const reportOpt = ["Sleep statistics", "Activity statistics"];

    const sleepOpt = ["Bedtime", "Wake time", "Sleep duration", "Sleep goals"];

    async function init() {
        getUsername();
        populateHomeButtons();
        printWelcome(USERNAME);
        printPrompt("What would you like to do?");
    }

    async function getUsername() {
        
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