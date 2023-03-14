-- Create an admin user and a client user in the timelog app
-- IMPORTANT: log in as 'timelogtest' to use the loaded sample data

CREATE USER 'timelogadmin'@'localhost' IDENTIFIED BY 'timelogpass';
CREATE USER 'timelogclient'@'localhost' IDENTIFIED BY 'clientpw';

CREATE ROLE 'client';
GRANT SELECT, INSERT, UPDATE ON timelogdb.* TO 'client';

GRANT ALL PRIVILEGES ON timelogdb.* TO 'timelogadmin'@'localhost';
GRANT 'client' TO 'timelogclient'@'localhost';
FLUSH PRIVILEGES;
