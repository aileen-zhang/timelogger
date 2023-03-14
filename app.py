"""
Command line application for TimeLogger
"""
import sys 
import mysql.connector
import mysql.connector.errorcode as errorcode

# TODO: set to false once completed
DEBUG = True

# ----------------------------------------------------------------------
# SQL Utility Functions
# ----------------------------------------------------------------------
def get_conn():
    """"
    Returns a connected MySQL connector instance, if connection is successful.
    If unsuccessful, exits.
    """
    try:
        conn = mysql.connector.connect(
          host='localhost',
          user='timelogadmin',
          port='3306',
          password='timelogpass',
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









def main():
    """
    Main function for starting things up.
    """
    print('yay!')


if __name__ == '__main__':
    conn = get_conn()
    main()