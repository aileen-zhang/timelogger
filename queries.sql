-- Example queries for timelog app

-- Get the activities available for one user to log and their logging symbols 
SELECT activity_name, symbol
FROM activity_key NATURAL JOIN user_task NATURAL JOIN user_info 
WHERE username = 'aileen'

-- Get a every user's most-logged non-sleep activity
SELECT user_id, MAX(activity_ct) / 2 AS hours_spent
FROM (SELECT user_id, task_id, activity_name 
        FROM user_task t NATURAL JOIN activity_key) tid_name
JOIN (SELECT task_id, COUNT(*) AS activity_ct 
        FROM timelog 
        GROUP BY task_id) act_ct
    ON tid_name.task_id = act_ct.task_id
GROUP BY user_id;


SELECT username, activity_name, activity_ct/2 AS hours_spent
FROM user_info
NATURAL JOIN user_task 
NATURAL JOIN activity_key 
NATURAL JOIN (SELECT task_id, COUNT(*) AS activity_ct 
    FROM timelog 
    GROUP BY task_id) a
WHERE username = 'aileen';