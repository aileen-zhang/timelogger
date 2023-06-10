/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to process inputs to the login form.
 */

(function() {
    "use strict";

    const LOGIN_URL = "/login";

    function init() {
        // going back to the login page is equivalent to logging out
        localStorage.removeItem("localUser");
        qs("#login-btn").addEventListener("click", (e) => {e.preventDefault(); 
                                                           checkLogin()});
    }

    /**
     * Event handler to check login info and navigate to home.html if credentials
     * are correct.
     * @returns none
     */
    async function checkLogin() {
        let user = qs("#username").value;
        let pass = qs("#password").value;
        if (user.length == 0 || pass.length == 0) {
            errMsg("Username and password are required.");
            return;
        }
        // TODO: check for admin status if admin login requested
        let admin = qs("#admin-opt").checked;
        let params =  new FormData();
        params.append("username", user);
        params.append("password", pass);

        let resp = await fetch(LOGIN_URL, {
            method: "POST", 
            body: params, 
            mode:"no-cors"});
        try {
            let r = checkStatus(resp);
            const ret = await r.json();
            if (ret.login == 1) {
                localStorage.setItem("localUser", user);
                location.href = "home.html";
            }
            else {
                errMsg("Incorrect username or password. Try again!");
            }
        } catch (error) {
            errMsg("There has been an error. Please try again.");
        }
    }

    /**
     * Helper function to display messages
     * @param {string} msg 
     */
    function errMsg(msg) {
        qs("#msg-area").textContent = msg;
    }

    init();
})();