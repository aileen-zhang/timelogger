/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to process inputs to the login form.
 */

(function() {
    "use strict";

    const DEBUG = true;
    const BASE_URL = "/";
    const IMG_URL = "imgs/";

    function init() {
        // loginErr();
    }

    function loginErr() {
        qs("#msg-area").textContent = "Incorrect username or password. Try again!"
    }

    init();
})();