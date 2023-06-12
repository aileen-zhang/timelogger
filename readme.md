# TimeLogger

TimeLogger now has a graphical web interface! Additional features present in the Python command line app will be ported to the web version. In the meantime, enjoy the clicky buttons.

### Required files

Place these files in the project directory:
```
> public/
    > imgs/ 
        > (UNDER CONSTRUCTION)
    > helpers.js
    > home.css
    > home.html
    > index.html
    > login.css
    > login.js
    > styles.css
    > time.js
    > timelogger.js
> app.js
> package.json
```

## Setup instructions

Follow the setup instructions for setting up `timelogdb` in the README located in the `sql/` folder. Navigate back to the API project directory. Make sure that you have Node.js and `npm` installed. Run the following commands:
```sh
npm install
node app.js
```
The console will print something like 
```sh
Listening on port 8000...
```
This indicates that the app has been started at `http://localhost:8000/` or whichever port is indicated. Use this port number throughout.

## Using the application

Navigate to http://localhost:8000/index.html with your browser of choice (preferably Chrome) to access the login page.

Fill out the login fields and hit the <kbd>Let's go!</kbd> button. The available users are:

| username     | password 
|--------------|----------
| `aileen`     | `azpw`     
| `testadmin`  | `op`      
| `testclient` | `nerfed`

Use the example credentials to access the test data. You will land on the home page for the application, located at http://localhost:8000/home.html. Select one of the option buttons to navigate the menus. You can logout with the button at the upper right at any time, which will bring you back to the index page.

## Menu structure

You can return to the home menu from any of the sub-menus by clicking the button at the upper left.
```
Log completed activity (UNDER CONSTRUCTION)
View logged data (UNDER CONSTRUCTION)
View data reports (UNDER CONSTRUCTION)
    Sleep statistics
        Summary
        Bedtime
        Wake time
        Sleep duration
        Sleep goals
    Activity statistics
View logging options
Add new activity
```
Options labeled `(UNDER CONSTRUCTION)` are not yet available.

Interact with the dropdown menus and input boxes to interact with the application. If an error occurs and is caught, the prompt area will display a message with instructions.

### Log completed activity

This form allows you to log an activity that you have defined before. Selecting a category from the first dropdown menu will populate the second dropdown menu with the activities in that category.

Currently, the time input is not available and the submit button will not interact with the server.

### View logged data & View data reports

Once implemented, these features will allow users to retrieve, analyze, and display their previous log entries. For now, to see sleep statistics, use the command line application.

### View logging options

Select a category from the dropdown menu to display a description of which activities are available for you to log under that category.

### Add new activity

Fill out the form to add a new activity to log. You can verify that this entry has been added in the <kbd>View logging options</kbd> menu.

## Admin options

In future versions, a separate admin application will allow an admin user to perform more powerful data manipulations and modifications if they choose to log in with the `Log in as admin` option checked on the login screen.

## Attribution

Sample data modified from [Aileen's time log of fall 2021](https://docs.google.com/spreadsheets/d/1NGe55vSQycfRIBiebFc60zmSeRqaMS72zelMbZAtP64/edit?usp=sharing)

Made by Aileen Zhang for the CS 132 course at Caltech

---

<details>
<summary>Dev notes</summary>

### TODOs and FIXMEs
#### High priority
* Add error handling in app.js
* Add image retrival endpoints and functions
* Finish APIDOC

#### Low priority
* Port sleep report functionality from app.py
* Better error handling using middleware stack
* Add text validation form entries (to prevent SQL injections)

#### New features
* Add graph generation (instead of hardcoded images)
* Activity reports
* Admin console and actions

#### Known bugs
* Adding new activity does not check for duplicates (should raise SQL warning)
* Test users don't have sleep tracking turned on by default
* Latest entry time is default time if a user has no log entries

</details>