# CS132 TimeLogger API Documentation
**Author:** Aileen Zhang
**Last Updated:** June 11 2023

The TimeLogger API allows users to interact with the TimeLogger database via a web application.

Summary of endpoints:
* GET /table/:name
* GET /filter/:name/:fields/:filters
* GET /images
* GET /images/:type (under construction)
* POST /login
* POST /add-activity
* POST /log-activity (under construction)
...


## *GET /table/:name*
**Returned Data Format**: JSON, string array

**Description:**
Returns all rows of a table within the `timelogdb` and the names of its columns.

**Parameters**
* /:name (required): the name of the table to SELECT

**Example Request:** `table/category`

**Example Response:** TBD

## *GET /filter/:name/:fields/:filters*
**Returned Data Format**: JSON, string array

**Description:** 
Queries a table or joined tables and returns the specified columns of rows that satisfy the filter criteria. Also returns an array of column names.

**Supported parameters**
* /:name (required): the name or names of the tables to SELECT from
* /:fields (required): the columns to fetch (can be `*` to fetch all columns)
* /:filters (required): the conditions in the WHERE clause of the query

**Example Request:** TBD

**Example Response:** TBD

**Error Handling:** TBD