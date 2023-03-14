-- Run this file to load in sample data

-- QUESTION: user addition here is extremely hacky; how should I generate a user
-- before loading in more data that depends on user_id?
INSERT INTO user_info (user_id, username)
VALUES (1000, 'sample');

LOAD DATA LOCAL INFILE 'data_f21/task.csv' INTO TABLE user_task
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
(user_id, symbol) SET task_id = NULL;

LOAD DATA LOCAL INFILE 'data_f21/categories.csv' INTO TABLE category
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'data_f21/key.csv' INTO TABLE activity_key
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'data_f21/log.csv' INTO TABLE timelog
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
(log_time, task_id);