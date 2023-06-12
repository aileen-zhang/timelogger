/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to add functionality to the timelogger UI.
 */

(function() {
    "use strict";

    const TABLE_URL = "/table/";
    const FILTER_URL = "/filter/"
    const ADD_URL = "/add-activity";
    // const LOG_URL = "/log-activity";
    const IMG_URL = "/images"

    // Preset dictionaries of button text and button label
    const HOME_OPT = {"Log completed activity": "log-act", "View logged data": "view-data",
                    "View data reports": "view-reps", "View logging options": "view-opts", 
                    "Add new activity": "new-act"};

    const REPORT_OPT = {"Sleep statistics": "sleep-stats", "Activity statistics": "act-stats"};

    const SLEEP_OPT = {"Summary":"sleep-summary", "Bedtime":"bedtime", "Wake time":"wake-time", 
                        "Sleep duration":"sleep-dur", "Sleep goals":"sleep-goals"};

    const DATA_OPT = {"Return image (testing)":"ret-img", "Bar graph": "bar-graph", 
                     "Pie chart": "pie-chart"};

    // const TIME_OPT = {"This 30 minutes": "this-30", "Last 30 minutes": "last-30",
    //                  "Custom time range": "custom-time"};

    // constants that should be populated once per page load
    let usernameLoggedIn;
    let userIdLoggedIn;
    let categories = {};

    async function init() {
        installButtons();
        usernameLoggedIn = localStorage.getItem("localUser");
        let check = await checkUser();
        if (check) {
            await getCategories();
            populateMenuButtons("main-menu", HOME_OPT);
            populateMenuButtons("report-menu", REPORT_OPT);
            populateMenuButtons("sleep-menu", SLEEP_OPT);
            populateMenuButtons("data-menu", DATA_OPT);
            installNav();
            installFormSubmits();
            showHome();
        }
   }

/************************** SETUP HELPERS **************************/
   /**
    * Install handlers for logout and return to home buttons
    */
    function installButtons() {
        qs("#logout-btn").addEventListener("click", 
                         () => {localStorage.removeItem("localUser"); 
                                usernameLoggedIn = null;
                                location.href = "index.html";});
        qs("#home-btn").addEventListener("click", showHome);
   }

    /**
     * Checks for a logged in user of the TimeLogger app, which should
     * only occur when this page is reached directly from the login page.
     * Also populate the userIdLoggedIn value for later use.
     * @returns {boolean} - true if there is a logged in user, false otherwise
     */
    async function checkUser() {
        if (!usernameLoggedIn) {
            printPrompt("Please log out and log in again.");
            return false;
        }
        let resp = await fetch(FILTER_URL + 
                `user_info/user_id,is_admin/username='${usernameLoggedIn}'`);
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            let data = ret.rows;
            if (data.length == 1) {
                userIdLoggedIn = data[0].user_id;
            }
            else {
                printPrompt("Error in user_id retrieval. Please try again.");
                return false;
            }
        } catch (err) {
            handleError(err);
            return false;
        }
        return true;
    }

    /**
     * Puts the logging categories in a dictionary of {name: description} pairs
     * @returns none
     */
    async function getCategories() {
        let resp = await fetch(TABLE_URL + "category");
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            let data = ret.rows;
            let names = ret.fields;
            for (let i = 0; i < data.length; i++) {
                categories[data[i][names[0]]] = data[i][names[1]].trimEnd();
            }
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * Retrieve the activities belonging to the input category.
     * @param {string} category
     * @returns {Object[]} - a list of JSON objects containing
     *                       {symbol, activity_name, activity_desc, goal_time}
     */
    async function getActivities(category) {
        let tableName = encodeURI("user_task NATURAL JOIN activity_key");
        let whereClause = encodeURI(`category_name='${category}' AND 
                                     user_id=${userIdLoggedIn}`);
        let tableCols = "symbol,activity_name,activity_desc,goal_time"
        let qStr = `${tableName}/${tableCols}/${whereClause}`;
        let resp = await fetch(FILTER_URL + qStr);
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            return ret.rows;            
        } catch (err) {
            handleError(err);
        }
    }


/************************** MENU DISPLAY HANDLERS **************************/
    /**
     * Attach sub-menu display handlers to all generated menu buttons
     */
    function installNav() {
        id("log-act").addEventListener("click", showLog);
        id("view-data").addEventListener("click", showData);
        id("view-reps").addEventListener("click", showReps);
        id("view-opts").addEventListener("click", showOpts);
        id("new-act").addEventListener("click", showNew);
        id("sleep-stats").addEventListener("click", showSleep);
        // this is just a demo of the image return
        id("ret-img").addEventListener("click", async () => {await retImgTest()});
    }

    /**
     * Show the main menu (home menu) and reset form fields
     */
    function showHome() {
        printWelcome(usernameLoggedIn);
        printPrompt("What would you like to do?");
        revealMenu("main-menu");
        // hack to reset selection dropdowns, table displays, etc.
        populateCategoryDropdowns();
        let actDD = id("log-act-sel");
        let def = makeDefaultOpt("First choose a category");
        actDD.innerHTML = "";
        actDD.appendChild(def);
        id("opt-info").innerHTML = "";
    }

    function showLog() {
        printMsg("Log a completed activity");
        printPrompt("Record an activity, time period, and an optional description.");
        revealMenu("log-menu");
    }

    function showData() {
        printMsg("View logged data");
        printPrompt("Select a data visualization format. [UNDER CONSTRUCTION]");
        revealMenu("data-menu");
    }

    function showReps() {
        printMsg("View activity reports");
        printPrompt("Select a report option.");
        revealMenu("report-menu");
    }

    function showOpts() {
        printMsg("View logging options");
        printPrompt("Select a category to view activities, descriptions, and goals (in minutes).");
        revealMenu("opt-menu");
    }

    function showNew() {
        printMsg("Add a new activity");
        printPrompt("Select a category, name, symbol, and an optional description and goal.");
        revealMenu("add-menu");
    }

    function showSleep() {
        printMsg("Sleep analysis reports");
        printPrompt("Select the report you would like to view. [UNDER CONSTRUCTION]");
        revealMenu("sleep-menu");
    }


/************************** IMAGE RETRIEVAL TESTS **************************/
    /**
     * Get all images from the /imgs folder to display (eventually, these will
     * be generated data graphics, but for now, they are just screenshots)
     */
    async function retImgTest() {
        // TODO
    }


/************************** PAGE INITIALIZERS **************************/
    /**
     * Initialize a page with menu options
     * @param {string} menuId
     * @param {Object} opts
     */
    function populateMenuButtons(menuId, opts) {
        const menu = id(menuId);
        menu.innerHTML = "";
        Object.keys(opts).forEach(option => {
            let newBtn = gen("button");
            newBtn.textContent = option;
            newBtn.id = opts[option];
            menu.appendChild(newBtn);
        });
    }

    /**
     * Helper function to make a hidden default prompt option
     * @param {string} msg 
     * @returns {Element} - generated <option>
     */
    function makeDefaultOpt(msg) {
        let defOpt = gen("option");
        defOpt.textContent = msg;
        defOpt.disabled = true;
        defOpt.selected = true;
        defOpt.value = "";
        defOpt.hidden = true;
        return defOpt;
    }

    /**
     * Initialize category dropdown menus with retrieved categories
     */
    function populateCategoryDropdowns() {
        const catDropdowns = qsa(".category-select");
        catDropdowns.forEach(sel => {
            sel.innerHTML="";
            let defOpt = makeDefaultOpt("Choose a category");
            sel.appendChild(defOpt);
            Object.keys(categories).forEach(cat => {
                let opt = gen("option");
                opt.textContent = cat;
                opt.value = cat;
                sel.appendChild(opt);
            });
        });
    }

    /**
     * Populate dropdown menu of activities for a selected category
     * @param {string} cat - name of category of interest
     * @param {string} selId - id of the select section to populate with options
     */
    async function populateActivityDropdown(cat, selId) {
        const sel = id(selId);
        sel.innerHTML="";
        let defOpt = makeDefaultOpt("Choose an activity");
        sel.appendChild(defOpt);
        let acts = await getActivities(cat);
        acts.forEach(act => {
            let opt = gen("option");
            opt.textContent = act.activity_name;
            opt.value = cat.symbol;
            sel.appendChild(opt);
        });
    }

    /**
     * Populate and display a table of activity name, description, and goal times
     * @param {string} cat - name of category of interest
     * @param {string} tabId - id of the table to populate with info
     */
    async function populateActivityTable(cat, tabId) {
        const tab = id(tabId);
        tab.innerHTML =`<tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Goal</th>
                        </tr>`;
        let acts = await getActivities(cat);
        acts.forEach(act => {
            let r = gen("tr");
            let n = gen("td");
            let d = gen("td");
            let g = gen("td");
            let gt = act.goal_time;
            let gs;
            if (gt > 0) { gs = "<" + gt }
            else if (gt < 0) { gs = ">" + (-gt) }
            else { gs = "..." }
            let ds = act.activity_desc;
            if (ds == "") { ds = "..." }
            n.textContent = act.activity_name;
            d.textContent = ds;
            g.textContent = gs;
            r.appendChild(n);
            r.appendChild(d);
            r.appendChild(g);
            tab.appendChild(r);
        });
    }


/************************** FORM HTML PROCESSING **************************/

    /**
     * Install handlers for buttons to submit the forms to log and add entries
     */
    function installFormSubmits() {
        qs("#log-cat-sel").addEventListener("change", 
            async () => {await populateLogActDropdown()});
        qs("#add-act-btn").addEventListener("click", 
            async (e) => {e.preventDefault(); await addNewActivity()});
        qs("#log-act-btn").addEventListener("click", 
            async (e) => {e.preventDefault(); await logActivity()});
        qs("#opt-cat-sel").addEventListener("change", 
            async () => {await populateActTable()});
    }

    /**
     * Run this function each time a new category is chosen to change a
     * dropdown menu to reflect the activities in that category.
     */
    async function populateLogActDropdown() {
        let cat = qs("#log-cat-sel").value;
        populateActivityDropdown(cat, "log-act-sel");
    }

    /**
     * Run this function each time a new category is chosen to populate a
     * table to display the activities.
     */
    async function populateActTable() {
        let cat = qs("#opt-cat-sel").value;
        populateActivityTable(cat, "opt-info");
    }
    
    /**
     * Given form contents, validates and posts new activity log option
     * @returns none
     */
    async function addNewActivity() {
        let cat = nm("add-act-cat").value;
        let act = nm("add-act-name").value;
        let sym = nm("add-act-sym").value;
        if (cat == "" || act == "" || sym == "") {
            printPrompt("Category, name, and symbol are required.");
            return;
        }
        let desc = nm("add-act-desc").value;
        let goal;
        try {
            let goalIpt = nm("goal-time").value;
            if (goalIpt == "") {
                goal = 0;
            }
            else {
                let pm = parseInt(qs("input[name='goal-pm']:checked").value);
                goal = pm * parseInt(goalIpt);
                if (isNaN(goal)) {
                    printPrompt("Please enter an integer goal time.")
                    return;
                }
            }
        } catch (err) {
            handleError(err);
        }
        
        let argStr = `'${sym}', '${act}', '${cat}', '${desc}', ${goal}`;

        let params =  new FormData();
        params.append("user_id", userIdLoggedIn);
        params.append("args", argStr);

        let resp = await fetch(ADD_URL, {
            method: "POST", 
            body: params, 
            mode:"no-cors"});
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            if (ret.success == 1) {
                printPrompt("New activity successfully added.");
            }
            else {
                printPrompt("Activity not added. Please try again.");
            }
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * Given form content, validates and posts new log entry
     * @returns none
     */
    async function logActivity() {
        // TODO: use a POST endpoint to call a stored procedure
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

    /**
     * Display just the menu element that matches the given id
     * @param {string} menuId - the id of the div element to show
     */
    function revealMenu(menuId) {
        if (menuId == "main-menu") {
            qs("#home-btn").classList.add("hidden");
        }
        else {
            qs("#home-btn").classList.remove("hidden");
        }
        const menus = qsa(".menu");
        const target = id(menuId);
        menus.forEach(menu => {
            if (menu == target) {
                menu.classList.remove("hidden");
            }
            else {
                menu.classList.add("hidden");
            }
        });
    }

/************************** ERROR HANDLING **************************/

    function handleError(err) {
        if (typeof err === "string") {
            printPrompt(err);
        } else {
            printPrompt("An error occurred during your request. Please try again.");
        }
    }

    init();
})();