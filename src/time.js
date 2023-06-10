/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the JS file to display the time in a consistent format across all pages.
 */

(function() {
    "use strict";
    const TICK = 10; // check time every 10 ms, so displayed time is mostly in sync
    let timerId;
    
    function init() {
        timerId = setInterval(() => { displayTime(); }, TICK);
    }

    /**
     * Update current date and time
     */
    function displayTime() {
        let date = new Date();
        let secStr = date.getSeconds().toString().padStart(2,"0");
        let minStr = date.getMinutes().toString().padStart(2,"0");
        let hr = date.getHours();
        let ampm;
        let hrStr;
        if (hr < 12) {
            ampm = "AM";
            if (hr == 0) { hrStr = "12"; }
            else { hrStr = hr.toString(); }
        }
        else {
            ampm = "PM";
            if (hr == 12) { hrStr = "12"; }
            else { hrStr = (hr-12).toString(); }
        }
        let day = date.getDate();
        let month = date.toLocaleString('default', { month: 'long' });
        let year = date.getFullYear();
        let timeStr = `${hrStr}:${minStr}:${secStr} ${ampm}`
        let dateStr = `${month} ${day} ${year}`;
        qs("#time").textContent = timeStr;
        qs("#date").textContent = dateStr;
    }

    init();
})();