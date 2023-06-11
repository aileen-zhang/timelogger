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
// const fs = require("fs/promises");
const path = require("path");

const globby = require("globby");
const multer = require("multer");
const { assert } = require("console");

const SERVER_ERROR = "Something went wrong on the server, please try again later.";
const SERVER_ERR_CODE = 500;
const CLIENT_ERR_CODE = 400;
const DEBUG = true;

const app = express();


// To handle different POST formats:
// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none());

app.use(express.static("src"));


// For Express apps, here's a recommended program breakdown (see OH app.js for larger example)
// (first, make sure you have your setup.sql DDL finalized)
// 1. Endpoints as usual
// 2. Helper functions
// - SELECT queries
// - INSERT/DELETE/UPDATE queries
// - Other helper functions
// - getDB()

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
        console.log("/login broke");
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


/**
 * Call the stored procedure to add a new logging activity (assuming the inputs
 * have been validated).
 */
app.post("/add-activity", async (req, res) => {
    let uid = req.body.user_id;
    let args = req.body.args;
    console.log(args);
    let addQuery = `CALL setup_activity(${uid}, ${args});`;
    try {
        let [resp,_] = await queryDB(addQuery);
        let aff = resp.affectedRows;
        let warn = resp.warningStatus;
        console.log(aff);
        console.log(warn);
        if (aff == 1 && warn == 0) {
            res.send({success: 1});
        }
        else {
           res.send({success: 0}); 
        }
    }
    catch (err) {
        console.log("/add-activity broke");
    }
})

/**
 * Call a stored procedure to add an entry collected from a form.
 */
app.post("/log-activity", async (req, res) => {



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
        console.log("query broke!");
        console.log(err);
    }
}

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
        console.log(err);
    }
}

/**
 * Establishes a database connection to the YOURDB and returns the database object.
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