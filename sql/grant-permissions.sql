-- Create and use database
CREATE DATABASE IF NOT EXISTS timelogdb;
USE timelogdb;

-- Create an admin user and a client user in the timelog app
CREATE USER IF NOT EXISTS 'timelogadmin'@'localhost' IDENTIFIED BY 'adminpw';
CREATE USER IF NOT EXISTS 'timelogclient'@'localhost' IDENTIFIED BY 'clientpw';

CREATE ROLE IF NOT EXISTS 'client';
GRANT SELECT, INSERT, UPDATE ON timelogdb.* TO 'client';

GRANT ALL PRIVILEGES ON timelogdb.* TO 'timelogadmin'@'localhost';
GRANT 'client' TO 'timelogclient'@'localhost';
FLUSH PRIVILEGES;
