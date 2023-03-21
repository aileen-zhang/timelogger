'''
Command line application for TimeLogger
'''

# imports
import sys 
import mysql.connector
import mysql.connector.errorcode as errorcode
# allows user to enter password without printing it on the command line
from getpass import getpass
from datetime import datetime as dt
import datetime


# ----------------------------------------------------------------------
# Global variables
# ----------------------------------------------------------------------

# TODO: set to false once completed
DEBUG = True

# ----------------------------------------------------------------------
# Pretty-printing assets
# ----------------------------------------------------------------------

DASHES = '-----------------------------------------------------'
SM_DASHES = '---------------'

def check_input(message):
    ''' 
    Check if user input is 'exit'
    '''
    response = input(message)
    if response == 'exit':
        quit_ui()
    else:
        return response

def legend_text(legend, text):
    '''
    String formatter for selection number and option
    '''
    print(f"({legend}) {text}")

def logout_msg():
    legend_text('X', 'Logout')

def back_msg(msg=''):
    legend_text('B', 'Back' + msg)

def not_valid_msg():
    print("Not a valid option")

def not_done_msg():
    print('Some options are still under construction')

def choose_opt_input(valid_values=None):
    '''
    Take in user input option checked against valid_values
    '''
    r = check_input("Choose an option: ")
    if valid_values != None:
        if r not in valid_values:
            not_valid_msg()
            return choose_opt_input(valid_values)
    return r

def curr_time():
    ''' 
    A string with the current time in YYYY-MM-DD HH:MM pm/am format
    '''
    text = "The current time is "
    time = dt.now().strftime("%Y-%m-%d %-I:%M %p")
    return text + time

def generate_print_opts(lst):
    ''' 
    Map list of options to the integers 1, 2... and return list of int strings
    '''
    valid_values = []
    for i, o in enumerate(lst):
        legend_text(i+1, o)
        valid_values.append(str(i+1))
    return valid_values

def choose_category():
    ''' 
    Modification of generate_print_opts() for admin-defined categories
    '''
    print(DASHES)
    print("Choose a category:")
    print()
    cat_query = """SELECT category_name FROM category;"""
    raw_cats = execute_query(cat_query, "Categories not retrieved!")
    categories = [c[0] for c in raw_cats]
    valid_values = generate_print_opts(categories)
    print(DASHES)
    r = choose_opt_input(valid_values)
    return r, categories

def choose_activity(cat):
    '''
    Modification of generate_print_opts() given a category of activity
    '''
    print(DASHES)
    print(f"Choose an activity in the {cat} category:")
    print()
    act_query = """SELECT symbol, activity_name 
                   FROM user_task NATURAL JOIN activity_key
                   WHERE category_name = '%s'
                   AND user_id = %s;""" % (cat, user_id)
    raw_acts = execute_query(act_query, "Activities not retrieved!")
    valid_values = []
    for sym, name in raw_acts:
        legend_text(sym, name)
        valid_values.append(sym)
    if len(valid_values) == 0:
        print('No available activities in this category')
        print("Returning to home menu")
        home_menu()
    print(DASHES)
    s = choose_opt_input(valid_values)
    return s

# ----------------------------------------------------------------------
# Option menu lists
# ----------------------------------------------------------------------

home_opt = ["Log existing activity", "View logged data", "View reports",
            "View logging options", "Add new activity"]

time_opt = ["This 30 minutes", "Last 30 minutes", "Custom time range"]

admin_opt = ["Superuser account", "Modify user", "Export logs"]

usermod_opt = ["Add user", "Remove user", "Change privileges"]

report_opt = ["Sleep statistics", "Activity statistics"]

sleep_opt = ["Bedtime", "Wake time", "Sleep duration", "Sleep goals"]

# ----------------------------------------------------------------------
# SQL Utility Functions
# ----------------------------------------------------------------------
def get_conn():
    '''"
    Returns a connected MySQL connector instance, if connection is successful.
    If unsuccessful, exits.
    '''
    try:
        conn = mysql.connector.connect(
          host='localhost',
          user='timelogadmin',
          port='3306',
          password='adminpw',
          database='timelogdb'
        )
        if DEBUG:
            print('Successfully connected.')
        return conn
    except mysql.connector.Error as err:
        # If we get here, we're in trouble.
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR and DEBUG:
            sys.stderr('Incorrect username or password when connecting to DB.')
        elif err.errno == errorcode.ER_BAD_DB_ERROR and DEBUG:
            sys.stderr('Database does not exist.')
        elif DEBUG:
            sys.stderr(err)
        else:
            sys.stderr('An error occurred, please contact the administrator.')
        sys.exit(1)

def execute_query(query, err_msg):
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
    except mysql.connector.Error as err:
        if DEBUG:
            sys.stderr(err)
            sys.exit(1)
        else:
            sys.stderr(err_msg)
            return
    return rows

def execute_proc(proc, args, err_msg):
    try:
        cursor = conn.cursor()
        cursor.callproc(proc, args)
        conn.commit()
        return True
    except mysql.connector.Error as err:
        if DEBUG:
            sys.stderr(err)
            sys.exit(1)
        else:
            sys.stderr(err_msg)
            return False
# ----------------------------------------------------------------------
# Navigation menus
# ----------------------------------------------------------------------

'''
NAVIGATIONAL STRUCTURE

Key:
 (1) | (#) -- option into deeper level
 (B) | (X) -- option up one level
 (*)       -- jump to specified level
 (_)       -- user data entry

Layers:
 0   1   2   3   4   5
 |   |   |   |   |   |
(1) Login    |   |   |
    (_) Username |   |
    (_) Password |   |
    (0) Admin tools  |
        (1) Superuser account
            (#) Choose user
                (*) Return to layer 1 as admin'd user
        (2) Modify user
            (1) Add user
                (_) New username
                (_) New password
                (_) Admin status
            (2) Remove user
            (3) Change privileges
            (B) Back
        (3) Export logs
            (_) Export filename target
        (B) Back
    (1) Log existing activity
        (#) Choose category
            (#) Choose activity
                (#) Choose time format
                (B) Back
            (B) Back
        (B) Back
    (2) View logged data
        (1) ??
    (3) View reports
        (1) Sleep statistics
            (0) Summary
            (1) Bedtime
            (2) Wake time
            (3) Sleep duration
            (4) Sleep goals
            (B) Back
        (2) Activity statistics
            (1) Specific activity
                (#) Choose activity
                    (1) Dates of interest
                    (2) Averages
                    (3) Goals
                    (B) Back
                (B) Back
            (2) Category aggregates
                (#) Choose category
                    (1) Dates of interest
                    (2) Averages
                    (B) Back
                (B) Back
            (B) Back
        (B) Back
    (4) View logging options
    (5) Add new activity
        (#) Choose category
            (_) Activity name
            (_) Logging symbol
            (_) Optional description
            (_) Optional goal time
            (*) Return to layer 1 as same user
    (X) Logout
(X) Exit
'''

######## LAYER 0: START MENU ########

def start_menu():
    '''
    Start menu for all users
    '''
    print(DASHES)
    print(SM_DASHES, 'Welcome to TimeLogger', SM_DASHES)
    print(DASHES)
    print(curr_time())
    print()
    print('What would you like to do?')
    print()
    legend_text(1, 'Login')
    legend_text('X', 'Exit')
    print(DASHES)
    r = choose_opt_input(['X', '1'])
    if r == 'X':
        print(DASHES)
        print(SM_DASHES, "See you again soon :)", SM_DASHES)
        print(DASHES)
        exit()
    elif r == '1':
        return login()
    print('END OF PROGRAM??', SM_DASHES)

def login():
    ''' 
    Log in to the database, setting user-specific global variables
    '''
    global username, is_admin, user_id
    username_ipt = check_input("Enter your username: ")
    password = getpass("Enter your password: ")
    login_query = "SELECT authenticate('%s', '%s');" % (username_ipt, password)
    success = execute_query(login_query, 'Login error!')
    if success[0][0]:
        username = username_ipt
        info_query = """
                SELECT user_id, is_admin FROM user_info 
                WHERE username = '%s';""" % (username)
        info_chk = execute_query(info_query, 'Info check error!')
        if info_chk[0][1]:
            is_admin = True
        else:
            is_admin = False
        user_id = info_chk[0][0]
        home_menu()
    else:
        print(DASHES)
        print('Invalid credentials! Try again')
        login()
    
######## LAYER 1: HOME MENUS ########

def home_menu():
    print(DASHES)
    print("Welcome back,", username)
    print()
    if is_admin:
        legend_text(0, "Admin tools")
    valid_values = generate_print_opts(home_opt)
    logout_msg()
    valid_values.append('X')
    if is_admin:
        valid_values.append('0')
    print(DASHES)
    r = choose_opt_input(valid_values)
    home_navigation(r)

def home_navigation(choice):
    match [choice, is_admin]:
        case ['0', True]:
            admin_tools()
        case ['1', _]:
            log_activity()
        # case ['2', _]:
        #     view_data()
        case ['3', _]:
            view_reports()
        # case ['4', _]:
        #     view_log_opt()
        case ['5', _]:
            add_activity()
        case ['X', _]:
            start_menu()
        case _:
            not_done_msg()
            not_valid_msg()
            r = choose_opt_input()
            home_navigation(r)


######## LAYER 2+: ADMIN TOOLS ########

def admin_tools():
    print(DASHES)
    print("Admin tools")
    print()
    valid_values = generate_print_opts(admin_opt)
    back_msg()
    valid_values.append('B')
    print(DASHES)
    r = choose_opt_input(valid_values)
    admin_navigation(r)

def admin_navigation(choice):
    match choice:
        # case '1':
            # select_user()
        case '2':
            modify_user()
        # case '3':
            # export_logs()
        case 'B':
            home_menu()
        case _:
            not_done_msg()
            not_valid_msg()
            r = choose_opt_input()
            admin_navigation(r)

def modify_user():
    print(DASHES)
    print("Modify user")
    print()
    valid_values = generate_print_opts(usermod_opt)
    back_msg()
    valid_values.append('B')
    print(DASHES)
    r = choose_opt_input(valid_values)
    usermod_navigation(r)

def usermod_navigation(choice):
    match choice:
        case '1':
            new_user()
            admin_tools()
        # case '2':
        #     select_user()
        # case '3':
        #     export_logs()
        case 'B':
            admin_tools()
        case _:
            not_done_msg()
            not_valid_msg()
            r = choose_opt_input()
            usermod_navigation(r)


######## LAYER 2+: LOG ACTIVITY ########

def log_activity():
    r, cats = choose_category()
    category = cats[int(r) - 1]
    s = choose_activity(category)
    print(DASHES)
    print(curr_time())
    print()
    print("Choose a time to log:")
    print()
    valid_values = generate_print_opts(time_opt)
    back_msg(' to home')
    valid_values.append('B')
    print(DASHES)
    choice = choose_opt_input(valid_values)
    ts = 0
    while ts == 0:
        match choice:
            case '1':
                ts = round_half_hr(dt.now())
            case '2':
                ts = round_half_hr(dt.now() - datetime.timedelta(minutes=30))
            # case '3':
                # custom_times()
            case 'B':
                break
            case _:
                not_done_msg()
                not_valid_msg()
                choice = choose_opt_input(valid_values)
    if ts:
        execute_proc('log_entry', (user_id, s, ts), "Logging unsuccessful!")
        print('Activity has been logged if not indicated otherwise')
    home_menu()


######## LAYER 2+: VIEW REPORTS ########

def view_reports():
    print(DASHES)
    print("View reports")
    print()
    valid_values = generate_print_opts(report_opt)
    back_msg()
    valid_values.append('B')
    print(DASHES)
    r = choose_opt_input(valid_values)
    report_navigation(r)

def report_navigation(choice):
    match choice:
        case '1':
            sleep_reports()
        # case '2':
            # activity_reports()
        case 'B':
            home_menu()
        case _:
            not_done_msg()
            not_valid_msg()
            r = choose_opt_input()
            report_navigation(r)

def sleep_reports():
    print(DASHES)
    print("Sleep statistics")
    print()
    legend_text(0, "Summary")
    valid_values = generate_print_opts(sleep_opt)
    back_msg()
    valid_values.append('B')
    valid_values.append('0')
    print(DASHES)
    r = choose_opt_input(valid_values)
    sleep_navigation(r)

def sleep_navigation(choice):
    match choice:
        case '0':
            sleep_summary()
        case '1':
            bedtime()
        # case '2':
        #     wake_time()
        # case '3':
        #     sleep_duration()
        # case '4':
        #     sleep_goals()
        case 'B':
            view_reports()
        case _:
            not_done_msg()
            not_valid_msg()
            r = choose_opt_input()
            sleep_navigation(r)

def sleep_date_input():
    print(DASHES)
    print("Select (T) to see the most recent statistics\nor enter a date in YYYY-MM-DD format")
    print(DASHES)      
    time = check_input("Enter [T] or date of interest: ")
    if time == 'T':
        time = (dt.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    return time

def sleep_summary():
    '''
    Displays data summary of sleep stats for a selected day
    '''
    d = sleep_date_input()
    bt_query = """SELECT bedtime('%s', %s), ;"""%(d, user_id)
    bt_raw = execute_query(bt_query, "Bedtime calculation failed!")
    bt = bt_raw[0][0]
    if bt == None:
        bt = "not logged"
    print(DASHES)
    print(f'Your bedtime on {time} was {bt}')
    sleep_reports()
    


def bedtime():
    d = sleep_date_input()
    bt_query = """SELECT bedtime('%s', %s);"""%(d, user_id)
    bt_raw = execute_query(bt_query, "Bedtime calculation failed!")
    bt = bt_raw[0][0]
    if bt == None:
        bt = "not logged"
    print(DASHES)
    print(f'Your bedtime on {time} was {bt}')
    sleep_reports()


# ----------------------------------------------------------------------
# Time functions
# ----------------------------------------------------------------------


def round_half_hr(timestamp):
    ''' 
    Round down the given value to the nearest half hour
    '''
    return timestamp - (timestamp - dt.min) % datetime.timedelta(minutes=30)

def custom_times():
    '''
    Menus for entering log entries within the last 3 days
    '''
    dates = []
    for i in range(3):
        dates.append(dt.today() - datetime.timedelta(days=(2-i)))
        
    def prompt1(message):
        print(DASHES)
        print(curr_time())
        print()
        print(message)
        for i, d in enumerate(dates):
            legend_text(i+1, d.strftime("%-m/%-d/%y"))
        print(DASHES)

    def prompt2(message):
        print(DASHES)
        print(curr_time())
        print()
        print(message)
        print("in HH:MM format")
        print(DASHES)

    def assemble_date(day, time):
        pass

    # hard-coded to only allow backlogs of 3 days
    options = '123'

    prompt1("Select start date:")
    start_day = int(choose_opt_input(options))
    prompt2("Enter start time on " + dates[start_day - 1].strftime("%-m/%-d/%y"))
    start_time = check_input("Enter start time: ")

    prompt1("Select end date:")
    end_day = int(choose_opt_input(options))
    while start_day > end_day:
        print("End day cannot be before start day")
        end_day = int(choose_opt_input(options))
    prompt2("Enter end time on " + dates[end_day - 1].strftime("%-m/%-d/%y"))
    end_time = check_input("Enter end time: ")


# ----------------------------------------------------------------------
# Viewing functions
# ----------------------------------------------------------------------

# TODO

# ----------------------------------------------------------------------
# Activity key functions
# ----------------------------------------------------------------------

# NOTE: this is the only function necessary for (5) Add new activity
def add_activity():
    ''' 
    Prompt user for category of new activity, collect query arguments, and
    execute query to insert activity using user_id
    '''
    r, cats = choose_category()
    category = cats[int(r) - 1]
    print(DASHES)

    name = check_input(f"Enter the name of an activity in the {category} category: ")
    while len(name) > 20:
        name = check_input("Name must be 20 characters or less, try again: ")
    
    symbol = check_input("Enter a logging symbol for the activity: ")
    while len(symbol) > 10:
        symbol = check_input("Symbol must be 10 characters or less, try again: ")
    
    desc = check_input("Enter an optional description: ")
    goal_str = check_input("Enter an optional time goal in minutes: ")
    if goal_str == '':
        goal = 0
    else:
        try:
            goal = int(goal_str)
            if goal <= 0:
                raise Exception()
            match check_input("Is your goal to spend [m]ore or [l]ess time? "):
                case 'm':
                    goal *= -1
                case 'l':
                    pass
                case _:
                    raise Exception()
        except:
            not_valid_msg()
            print('Goal time defaulted to 0 min')
            goal = 0
    
    args = [user_id, symbol, name, category, desc, goal]
    success = execute_proc("setup_activity", args, "Activity not added!")
    if success:
        print(f"New activity {name} added")
        
    home_menu()


# ----------------------------------------------------------------------
# Admin-specific functions
# ----------------------------------------------------------------------


def new_user():
    '''
    Get credentials for a new user and set up entry in database
    '''
    new_un = check_input("Enter new username: ")
    new_pw = getpass("Set new password: ")
    new_admin = check_input("User is [1] admin or [0] client: ")
    args = [new_un, new_pw, int(new_admin)]
    success = execute_proc('sp_add_user', args, "Failed to add user")
    if success:
        print(f"New user {new_un} added")

# def select_user():
#     users = ['test1', 'test2']
#     print(DASHES)
#     print('Select a user')
#     print()
#     for i, u in enumerate(users):
#         legend_text(i+1, u)
#     print(DASHES)
#     valid_values = []
#     for i in range(1, len(users) + 1):
#         valid_values.append(str(i))
#     r = choose_opt_input(valid_values)
#     username = users[int(r) - 1]


# ----------------------------------------------------------------------
# Flow control
# ----------------------------------------------------------------------

def quit_ui():
    '''
    Print confirmation message to user before exiting program
    '''
    check = input("Are you sure you want to exit? [y/n] ")
    if check == "y":
        print(DASHES)
        #print("------------ Thanks for using TimeLogger ------------")
        print(SM_DASHES, "See you again soon :)", SM_DASHES)
        print(DASHES)
        exit()

def main():
    '''
    Begin at the start menu
    '''
    start_menu()

if __name__ == '__main__':
    conn = get_conn()
    user_id = 0
    username = ''
    is_admin = False
    main()