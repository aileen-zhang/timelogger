# TimeLogger

TimeLogger is a command line Python application to track and analyze your time usage. TimeLogger supports multiple users and flexible analysis options.

## Setup instructions

### Required files

Place these files in the project directory:
```
> app.py
> grant-permissions.sql
> queries.sql
> setup-passwords.sql
> setup-routimes.sql
> setup.sql
```
Start the MySQL console and run the following commands:
```
mysql> source setup.sql;
mysql> source setup-passwords.sql;
mysql> source setup-routines.sql;
mysql> source grant-permissions.sql;
```

### Sample setup

You may wish to use the included sample data to try out some functionality. The sample data is provided in the folder `data_f21` within the project directory and contains these files:
```
> category.csv
> key.csv
> log.csv
> task.csv
```
The project directory should also contain the file `load-data.sql`. Run `mysql> source load-data.sql` to populate the tables.

After you have completed setup, `quit` the MySQL console.

## Using the application

Run `python3 app.py`. Upon success, the command line interface will look like this:
```
-------------------------------------
------- Welcome to TimeLogger -------
The current time is 1/2/23 12:34 pm

What would you like to do?
(1) Login
(X) Exit
-------------------------------------

Choose an option:
```
Press <kbd>1</kbd> <kbd>Enter</kbd> to select the login option. Enter your username and password when prompted. Upon successful login, you will have the following options:

```
-------------------------------------
Welcome back, user

(1) Log existing activity
(2) View logged data
(3) View logging options
(4) Add new activity
(X) Logout
-------------------------------------
```

### Log activity

Select <kbd>1</kbd> to log an activity that you have logged before.

```
-------------------------------------
Choose a category:

(1) Housework
(2) Employment
(3) Classes
(4) Self-Care
(5) Leisure
(6) Projects
(7) Other
(B) Back
-------------------------------------
```
The available activity options will be displayed next to their logging symbol. In this example, we choose <kbd>1</kbd>.
```
-------------------------------------
Enter an activity key:

(ln) laundry
(cl) cleaning
(B) Back
-------------------------------------
```
After selecting an activity, continue to assign it to a time block.
```
-------------------------------------
The current time is 1/2/23 12:35 pm

Select a time interval to log:

(1) This 30 minutes
(2) Last 30 minutes
(3) Custom
(B) Back
-------------------------------------
```
In this example, <kbd>1</kbd> would log 12:30--12:59 pm and <kbd>2</kbd> would log 12:00--12:29 pm. Select <kbd>3</kbd> to log an arbitrary time interval (in 30-minute increments) within the last 3 days. Note that the date is expressed in `MM/DD/YY` format.
```
-------------------------------------
The current time is 1/2/23 12:36 pm

Select start date:

(1) 12/31/22
(2) 1/1/23
(3) 1/2/23
-------------------------------------
```
In this example, we select option <kbd>2</kbd>. The entered time will be rounded to the nearest half-hour.

```
-------------------------------------
The current time is 1/2/23 12:36 pm

Enter start time on 1/1/23
in HH:MM format
-------------------------------------

Enter start time: 15:25
```
Repeat the above steps for the end time. NOTE: currently does not support overwriting previously logged times!


### View and export log

GRAPHICAL REPRESENTATIONS NOT YET IMPLEMENTED

### View and export analyses



#### General statistics

#### Sleep statistics


### View trackable activities



### Add activity




### Exiting the application

Navigate back to the home screen and select <kbd>X</kbd>, or enter `exit` at any time. Confirm your choice with <kbd>Y</kbd>. Hit any other key to return to the previous menu.

```
Choose an option: exit
----
Are you sure you want to log out and exit? y
----
Thanks for using TimeLogger!
```

## Admin options

Upon login with an admin account, you will see this menu. Notice the addition of the `Admin tools` option.

```
-------------------------------------
Welcome back, admin!

(0) Admin tools
(1) Log existing activity
(2) View logged data
(3) View logging options
(4) Add new activity
(X) Logout
-------------------------------------
```
The available tools are as follows:
```
-------------------------------------
Admin tools

(1) Superuser account
(2) Modify user
(3) Export logs
(B) Back
-------------------------------------
```
Select <kbd>1</kbd> to access full select, insert, update, and delete access to all data associated with a user. Select <kbd>2</kbd> to add or remove users, or elevate a client user to an admin. Select <kbd>3</kbd> to export the audit log of user actions.

## Attribution

Sample data modified from [Aileen's time log of fall 2021](https://docs.google.com/spreadsheets/d/1NGe55vSQycfRIBiebFc60zmSeRqaMS72zelMbZAtP64/edit?usp=sharing)

Made by Aileen Zhang for the CS 121 course at Caltech