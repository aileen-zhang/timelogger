-- Run this file to load in sample data

SET GLOBAL local_infile=1;

LOAD DATA LOCAL INFILE 'data_f21/task.csv' INTO TABLE user_task
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
(symbol, user_id) SET task_id = NULL;

LOAD DATA LOCAL INFILE 'data_f21/category.csv' INTO TABLE category
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'data_f21/key.csv' INTO TABLE activity_key
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'data_f21/log.csv' INTO TABLE timelog
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
(log_time, task_id);