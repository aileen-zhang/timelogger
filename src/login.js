/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to process inputs to the login form.
 */

(function() {
    "use strict";

    const DEBUG = true;
    const LOGIN_URL = "/";

    function init() {
        qs("#login-btn").addEventListener("click", (evt) => {checkLogin(evt)});
    }

    async function checkLogin(evt) {
        let params =  new FormData();
        let user = qs("#username").value;
        let pass = qs("#password").value;
        params.append("username", user);
        params.append("password", pass);

        // let resp = await fetch(LOGIN_URL, {method: "POST", body: params});
        // try {
        //     let correct = checkStatus(resp);
        if (pass == "asdf") {
            localStorage.setItem("localUser", user);
        }
        else {
            evt.preventDefault();
            loginErr();
        }
        // } catch (error) {
        //     handleError(error);
        // }

    }
    function loginErr() {
        qs("#msg-area").textContent = "Incorrect username or password. Try again!"
    }

    init();
})();