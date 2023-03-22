-- Queries for timelog app

-- Get list of all category names
SELECT category_name FROM category;

-- Get symbol, name pair of all activities in a category that a user can log
-- See RA exp (1)
SELECT symbol, activity_name 
FROM user_task NATURAL JOIN activity_key
WHERE category_name = 'classes'
AND user_id = 1000;

-- Authenticate a user with a UDF
SELECT authenticate('aileen', 'azpw');

-- Get user_id and check admin status of a user
-- See RA exp (2)
SELECT user_id, is_admin FROM user_info WHERE username = 'aileen';

-- Get bedtime for date and user_id; analogous queries used in other sleep stats
SELECT bedtime('2021-10-29', 1000);
