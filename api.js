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

app.post("/login", async (req, res) => {
    let un = req.body.username;
    let pw = req.body.password;
    let loginQuery = `SELECT authenticate('${un}', '${pw}');`;
    try {
        let [r,f] = await queryDB(loginQuery);
        let val = r[0][f[0].name];
        console.log(val);
        if (val == 1) {
            res.send({login: 1});
        }
        else {
            res.send({login: 0});
    }}
    catch (err) {
        console.log("/login broke");
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

// /**
//  * Given a SQL query string, connect to the database, execute the query, and
//  * return the results
//  * @param {string} qStr
//  * @returns {} the result of the query
//  */
async function queryDB(qStr) {
    let db = await getDB();
    try {
        db.connect();
        const data = await db.query(qStr)
        return data;
    }
    catch (err) {
        console.log("query broke!");
    }
}

// // TODO: similar function to execute stored procedures


// /**
//  * Establishes a database connection to the YOURDB and returns the database object.
//  * Any errors that occur during connection should be caught in the function
//  * that calls this one.
//  * @returns {Object} - The database object for the connection.
//  */
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