"use strict";
/**
 * Starter template for getting started with Node.js and promise-mysql.
 */
const mysql = require("promise-mysql");

const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const globby = require("globby");
const multer = require("multer");

const SERVER_ERROR = "Something went wrong on the server, please try again later.";
const SERVER_ERR_CODE = 500;
const CLIENT_ERR_CODE = 400;
const DEBUG = true;


// For Express apps, here's a recommended program breakdown (see OH app.js for larger example)
// (first, make sure you have your setup.sql DDL finalized)
// 1. Endpoints as usual
// 2. Helper functions
// - SELECT queries
// - INSERT/DELETE/UPDATE queries
// - Other helper functions
// - getDB()

// function stub for practicing queries
async function queryDB() {
    let db = getDB();
    db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
}

queryDB();

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