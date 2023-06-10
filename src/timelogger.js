/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to add functionality to the timelogger UI.
 */

(function() {
    "use strict";

    const TABLE_URL = "/table";
    

    // we assume that this value exists, since the user has successfully logged in
    const USERNAME = localStorage.getItem("localUser");

    const HOME_OPT = {"Log existing activity": "log-act", "View logged data": "view-data",
                    "View reports": "view-reps", "View logging options": "view-opts", 
                    "Add new activity": "new-act"};

    const TIME_OPT = {"This 30 minutes": "this-30", "Last 30 minutes": "last-30",
                     "Custom time range": "custom-time"};

    const REPORT_OPT = {"Sleep statistics": "sleep-stats", "Activity statistics": "act-stats"};

    const SLEEP_OPT = ["Bedtime", "Wake time", "Sleep duration", "Sleep goals"];

    // to be populated with a query
    let categories = {};

    async function init() {
        qs("#logout-btn").addEventListener("click", () => localStorage.removeItem("localUser"));
        getCategories();
        if (checkUser()) {
            getCategories();
            populateHomeButtons();
            printWelcome(USERNAME);
            printPrompt("What would you like to do?");
        }
    }

/************************** SETUP HELPERS **************************/
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
     * Puts the logging categories in a dictionary of {name: description} pairs
     * @returns none
     */
    async function getCategories() {
        let resp = await fetch(TABLE_URL, {
            method: "GET",
            params: {name: "category"}});
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            let data = ret.rows;
            let names = ret.fields;
            for (let i = 0; i < data.length; i++) {
                categories[data[i][names[0]]] = data[i][names[1]];
            }
            console.log(categories);
        } catch (error) {
            errMsg("There has been an error. Please try again.");
        }
    }

/************************** MENU INITIALIZERS **************************/

    /**
     * Initialize the page with the main menu options (client user)
     */
    function populateHomeButtons() {
        const menu = qs("#main-menu");
        menu.innerHTML = "";
        Object.keys(HOME_OPT).forEach(option => {
            let newBtn = gen("button");
            newBtn.textContent = option;
            newBtn.id = HOME_OPT[option];
            menu.appendChild(newBtn);
        });
    }





/************************** MESSAGE DISPLAY HELPERS **************************/
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