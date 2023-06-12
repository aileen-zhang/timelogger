/*
 * Author: Aileen Zhang
 * CS 132 Spring 2023
 * 
 * This is the API for the TimeLogger application. Documentation can be found at
 * APIDOC.md in this directory. 
 */

"use strict";

const mysql = require("mysql2/promise");

const express = require("express");
const path = require("path");

const globby = require("globby");
const multer = require("multer");

const SERVER_ERROR = "Something went wrong on the server, please try again later.";
const DATABASE_ERROR = "Query error, please check your inputs.";
const SERVER_ERR_CODE = 500;
const CLIENT_ERR_CODE = 400;
const DEBUG = true;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

app.use(express.static("src"));

/**
 * Given a username and password, returns whether the credentials are valid.
 * TODO check whether the user is an admin
 */
app.post("/login", async (req, res) => {
    let un = req.body.username;
    let pw = req.body.password;
    let loginQuery = `SELECT authenticate('${un}', '${pw}');`;
    try {
        let [r,f] = await queryDB(loginQuery);
        let val = r[0][f[0].name];
        res.send({login: val});
    }
    catch (err) {
        if (DEBUG) {
            console.log(`/login error: ${err}`)
        }
    }
});


/**
 * Given the name of a table, returns all rows and the names of the columns.
 */
app.get("/table/:name", async (req, res) => {
    let tableName = decodeURI(req.params.name);
    let tableQuery = `SELECT * FROM ${tableName};`;
    await getData(tableQuery, res);
})


/**
 * More advanced filtering capabilities
 */
app.get("/filter/:name/:fields/:filters", async (req, res) => {
    let tableName = decodeURI(req.params.name);
    let tableCols = decodeURI(req.params.fields);
    let whereClause = decodeURI(req.params.filters);
    let filterQuery = `SELECT ${tableCols} FROM ${tableName} WHERE ${whereClause};`;
    await getData(filterQuery, res);
})


app.get("/images", async (req, res) => {

})


/**
 * Call the stored procedure to add a new logging activity (assuming the inputs
 * have been validated).
 */
app.post("/add-activity", async (req, res) => {
    let uid = req.body.user_id;
    let args = req.body.args;
    let addQuery = `CALL setup_activity(${uid}, ${args});`;
    try {
        let [resp,_] = await queryDB(addQuery);
        let aff = resp.affectedRows;
        let warn = resp.warningStatus;
        if (aff == 1 && warn == 0) {
            res.send({success: 1});
        }
        else {
           res.send({success: 0}); 
        }
    }
    catch (err) {
        if (DEBUG) {
            console.log(`/add-activity error: ${err}`)
        }
    }
})


/**
 * Call a stored procedure to add an entry collected from a form.
 */
app.post("/log-activity", async (req, res) => {
    // TODO
})



/************************** DATABASE HELPERS **************************/
/**
 * Given a SQL query string, connect to the database, execute the query, and
 * return the results
 * @param {string} qStr
 * @returns {Object[][]} query results as two JSON arrays [rows, fields]
 */
async function queryDB(qStr) {
    let db = await getDB();
    try {
        db.connect();
        const data = await db.query(qStr);
        db.close();
        return data;
    }
    catch (err) {
        db.close();
        if (DEBUG) {
            console.log(`query error: ${err}`)
        }
    }
}


/**
 * Execute a query, send any returned data or an error message specified by
 * the calling function.
 * @param {string} qStr 
 * @param {Response} res 
 */
async function getData(qStr, res) {
    try {
        let [r, f] = await queryDB(qStr);
        let fnames = [];
        for (let i = 0; i < f.length; i++) {
            fnames.push(f[i].name);            
        }
        res.send({rows: r, fields:fnames});
    }
    catch (err) {
        if (DEBUG) {
            console.log(`data retrieval error: ${err}`)
        }
        // generic error handling here
    }
}


/**
 * Establishes a database connection to timelogdb and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDB() {
  let database = await mysql.createConnection({
      host: "localhost",
      port: "3306",
      user: "timelogadmin",
      password: "adminpw",
      database: "timelogdb"
  });
  return database;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});