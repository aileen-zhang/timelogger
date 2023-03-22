# TimeLogger

TimeLogger is a command line Python application to track and analyze your time usage. TimeLogger supports multiple users and flexible analysis options. (Timelogger is under heavy construction.)

## Setup instructions

### Required files

Place these files in the project directory:
```
> data_f21/
    > category.csv
    > key.csv
    > log.csv
    > task.csv
> app.py
> grant-permissions.sql
> load-data.sql
> queries.sql
> setup-passwords.sql
> setup-routimes.sql
> setup.sql
```

Start the MySQL console with permissions to load local infiles with
```sh
sudo mysql --local-infile
```
and run the following commands:
```sh
source grant-permissions.sql;
source setup.sql;
source setup-passwords.sql;
source setup-routines.sql;
source load-data.sql;
```

These commands will create and initialize the `timelogdb` database; create two database users, `timelogadmin` and `timelogclient`, with passwords `adminpw` and `clientpw` respectively; populate the data tables with the sample data in the `data_f21` folder; and create three application users (more details below).

After you have completed setup, `exit` the MySQL console.

## Using the application

Run `python3 app.py`. The application will attempt to log in as `timelogadmin`. Upon success, the command line interface will look like this:
```
-----------------------------------------------------
--------------- Welcome to TimeLogger ---------------
-----------------------------------------------------
The current time is 2023-03-21 7:16 AM

What would you like to do?

(1) Login
(X) Exit
-----------------------------------------------------
Choose an option:
```

Press <kbd>1</kbd> <kbd>Enter</kbd> to select the login option. There are three preset users:

| username   | password 
|------------|----------
| `aileen`     | `azpw`     
| `testadmin`  | `op`      
| `testclient` | `nerfed`

Log in as `aileen` to view and manipulate the test data. Upon successful login, you will have the following options:

```
-----------------------------------------------------
Welcome back, aileen

(0) Admin tools
(1) Log existing activity
(2) View logged data
(3) View reports
(4) View logging options
(5) Add new activity
(X) Logout
-----------------------------------------------------
```


### Navigational structure

Navigate the menus by selecting the relevant option code. The options indicated with `(_)` are data entry fields.
```
(1) Login    
    (_) Username 
    (_) Password
    (0) Admin tools  
        (1) Superuser account (UNDER CONSTRUCTION)
        (2) Modify user
            (1) Add user
                (_) New username
                (_) New password
                (_) Admin status
            (2) Remove user (UNDER CONSTRUCTION)
            (3) Change privileges (UNDER CONSTRUCTION)
            (B) Back
        (3) Export logs (UNDER CONSTRUCTION)
        (B) Back
    (1) Log existing activity
        (#) Choose category
        (#) Choose activity
            (1) This 30 minutes
            (2) Last 30 minutes
            (3) Custom time range (UNDER CONSTRUCTION)
            (B) Back to <Home>
    (2) View logged data (UNDER CONSTRUCTION)
    (3) View reports
        (1) Sleep statistics
            (0) Summary
            (1) Bedtime
            (2) Wake time
            (3) Sleep duration
            (4) Sleep goals
            (B) Back
        (2) Activity statistics (UNDER CONSTRUCTION)
        (B) Back
    (4) View logging options (UNDER CONSTRUCTION)
    (5) Add new activity
        (#) Choose category
            (_) Activity name
            (_) Logging symbol
            (_) Optional description
            (_) Optional goal time
    (X) Logout
(X) Exit
```
Follow the prompts to interact with the application.


### Log activity

Select this option to log an activity that you have logged before. In this example, let's log doing laundry for the last 30 minutes.

```
-----------------------------------------------------
Choose a category:

(1) classes
(2) employment
(3) housework
(4) leisure
(5) other
(6) projects
(7) self-care
-----------------------------------------------------
```
The available activity options will be displayed next to their logging symbol. In this example, we choose <kbd>3</kbd>.
```
-----------------------------------------------------
Choose an activity in the housework category:

(ln) laundry
(cl) cleaning
-----------------------------------------------------
```
After entering `ln`, continue to assign it to a time block.
``` 
-----------------------------------------------------
The current time is 2023-03-21 7:18 AM

Choose a time to log:

(1) This 30 minutes
(2) Last 30 minutes
(3) Custom time range
(B) Back to home
-----------------------------------------------------
```
Right now, the application supports logging the 30 minutes including the current time and the 30 minutes before that. For example, if it is 7:18 AM, `This 30 minutes` is the block from 7:00 - 7:29, and `Last 30 minutes` is the block from 6:30 - 6:59.


### View reports
Select this option to view analyses of previously logged data. A user can only see their own logged entries.

#### Sleep statistics
Sleep is a default activity for every new user, and can be logged using the `sl` symbol. Currently, the summary option takes in a date and shows the bedtime of the night before, the wake time of the day of, the sleep duration in between, and whether your sleep goal was achieved. See `setup-routines.sql` for how bedtimes, sleep duration, and wake times are calculated.

Here is an example output for the day `2021-10-29`.

```
-----------------------------------------------------
Select (T) to see the most recent statistics
or enter a date in YYYY-MM-DD format
-----------------------------------------------------
Enter [T] or date of interest: 2021-10-29
-----------------------------------------------------
Sleep statistics for 2021-10-29

Bedtime        : 0:30:00
Wake time      : 10:30:00
Sleep duration : 600 minutes
You met your sleep goal
-----------------------------------------------------

```

#### Activity statistics
Views of activity statistics will be added soon. The functionality will be very similar to the sleep tracking statistics. There will also be an option to view category aggregate times.


### Add new activity

Select this option to add new activities to log. After following the prompts, your new activity will be available to log upon returning to the home screen. For example, these are the new activity log options after adding Intro to Databases with the symbol `cs121`.

```
-----------------------------------------------------
Choose an activity in the classes category:

(cs11) CS 11
(cs156) CS 156a
(ma6) Ma 6a
(en100) En 100
(ee111) EE 111
(me13) ME 13
(cs121) Intro to Databases
-----------------------------------------------------
```


### Exiting the application

Navigate back to the home screen and select <kbd>X</kbd>, or enter `exit` at any time. Confirm your choice with <kbd>y</kbd>. Hit any other key to return to the previous menu.


## Admin options

Admin accounts have access to the `Admin tools` option. Currently, admins can add new admin and client users. Follow the prompts to enter the new user's username, password, and admin status.

Eventually, features will be added to allow admins to select, insert, update, and delete data associated with any user; remove users; elevate a client user to an admin; and export the audit log of user actions.

## Attribution

Sample data modified from [Aileen's time log of fall 2021](https://docs.google.com/spreadsheets/d/1NGe55vSQycfRIBiebFc60zmSeRqaMS72zelMbZAtP64/edit?usp=sharing)

Made by Aileen Zhang for the CS 121 course at Caltech