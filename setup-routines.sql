-- UDFs, stored procedures, and triggers for timelog app

DROP FUNCTION IF EXISTS daily_time;
DROP FUNCTION IF EXISTS goal_met;
DROP FUNCTION IF EXISTS bedtime;
DROP FUNCTION IF EXISTS wake_time;
DROP FUNCTION IF EXISTS sleep_duration;
DROP FUNCTION IF EXISTS sleep_goal_met;
DROP PROCEDURE IF EXISTS setup_user;
DROP PROCEDURE IF EXISTS setup_activity;
DROP PROCEDURE IF EXISTS log_entry;
DROP TRIGGER IF EXISTS add_user;

-- UDFs:
    -- daily_time(date, task_id)
    -- goal_met(date, task_id)
    -- bedtime(date, user_id)
    -- wake_time(date, user_id)
    -- sleep_duration(date, user_id)
    -- sleep_goal_met(date, user_id)
-- Stored procedures:
    -- setup_user(user_id)
    -- setup_activity(user_id, symbol, activity_name, category_name, 
    --                activity_desc, goal_time)
    -- log_entry(user_id, symbol, log_time)
-- Triggers:
    -- add_user

DELIMITER !

-- UDFs

-- Calculate how many minutes were spent on one activity on the specified date
    -- NOTE: day defined as 24 hours after midnight of given date
CREATE FUNCTION daily_time (d DATE, tid BIGINT) RETURNS INT DETERMINISTIC
BEGIN
    DECLARE ct INT;
    SELECT COUNT(*) INTO ct FROM timelog 
        WHERE DATE(log_time) = d AND task_id = tid;
    RETURN 30 * ct;
END !

-- Calculate if goal for a given task was met on a given day (24 hours)
    -- [signum(goal_time) * (daily_time(task_id) - abs(goal_time))] >= 0
    -- NOTE: sleep goal calculated separately below
CREATE FUNCTION goal_met (d DATE, tid BIGINT) RETURNS TINYINT(1) DETERMINISTIC
BEGIN
    DECLARE tot_t INT;
    DECLARE pm INT;
    DECLARE goal_t INT;
    SELECT goal_time INTO goal_t FROM activity_key WHERE task_id = tid;
    SET tot_t = daily_time(d, tid);
    SET pm = SIGN(goal_t);
    IF pm = 0 THEN
        RETURN 1;
    ELSEIF pm * tot_t < goal_t THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END !

-- Calculate sleep stats of a given date via the following algorithms:
    
    -- BEDTIME is calculated as the date-agnostic time at the beginning of the 
    -- longest block of contiguous sleep entries starting after noon on the 
    -- previous day and ending before 11:59 PM on the given day
    
    -- WAKE TIME is calculated as end of the longest contiguous block of sleep 
    -- entries ending on the given day, possibly starting on the previous day
   
    -- SLEEP DURATION is calculated as the number of sleep entries between the
    -- bedtime the wake time the given day

-- EXAMPLE SLEEP LOG VALUES:
    -- SLEEP START | SLEEP END
    -- --------------------------
    -- 1/1: 2 AM   | 1/1: 10 AM 
    -- 1/1: 11 PM  | 1/2: 8 AM
    -- 1/2: 1 PM   | 1/2: 3 PM  -- NAP: not counted in sleep
    -- 1/3: 12 AM  | 1/3: 7 AM

-- EXAMPLE RESULTS:
    -- DATE  | BEDTIME | WAKE TIME | SLEEP DURATION
    -- ----------------------------------------------
    -- 1/1   | 2 AM    | 10 AM     | 8 HRS
    -- 1/2   | 11 PM   | 8 AM      | 9 HRS
    -- 1/3   | 12 AM   | 7 AM      | 7 HRS

-- helper functions to get noon and just-before midnight on a given day
CREATE FUNCTION IF NOT EXISTS get_noon (d DATE) RETURNS TIMESTAMP DETERMINISTIC
BEGIN
    RETURN CAST(d AS DATETIME) + TIME('12:00:00');
END !

CREATE FUNCTION IF NOT EXISTS get_mn (d DATE) RETURNS TIMESTAMP DETERMINISTIC
BEGIN
    RETURN CAST(d AS DATETIME) + TIME('23:59:59');
END !

CREATE FUNCTION bedtime (d DATE, uid BIGINT) RETURNS TIME DETERMINISTIC
BEGIN
    -- sleep task_id for user
    DECLARE tid BIGINT;
    -- tracks whether currently in a sleep block
    DECLARE is_sleep TINYINT DEFAULT 0;
    -- number of contiguous logged sleep entries in currently processed block
    DECLARE c_dur INT DEFAULT 0;
    -- largest length of block so far
    DECLARE max_dur INT DEFAULT 0;
    -- current candidate bedtime
    DECLARE bt TIME DEFAULT '00:00:00';
    -- cursor variables
    DECLARE cur_ts TIMESTAMP;
    DECLARE cur_tid BIGINT;
    DECLARE done INT DEFAULT 0;
    DECLARE slept INT;

    DECLARE cur CURSOR FOR 
        SELECT log_time, task_id FROM user_task NATURAL JOIN
            (SELECT * FROM timelog
            WHERE log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d)) t
        WHERE user_id = uid
        ORDER BY log_time DESC;

    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
        SET done = 1;
    
    -- assume default sleep log symbol 'sl'
    SELECT task_id INTO tid FROM user_task 
        WHERE user_id = uid AND symbol = 'sl';

    -- if user didn't sleep at all, return NULL bedtime
    SELECT COUNT(*) INTO slept 
        FROM timelog 
        WHERE task_id = tid
        AND log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d);
    IF slept = 0 THEN
        RETURN NULL;
    END IF;

    OPEN cur;
    WHILE NOT done DO
        FETCH cur INTO cur_ts, cur_tid;
        IF NOT done THEN

            -- if sleep is logged...
            IF tid = cur_tid THEN

                -- if already in a sleep block...
                IF is_sleep = 1 THEN
                    -- extend length of current sleep block
                    SET c_dur = c_dur + 1;
                    -- check length against max length and update bedtime
                    IF c_dur > max_dur THEN
                        SET max_dur = c_dur;
                        SET bt = cur_ts;
                    END IF;

                -- if not in a sleep block...
                ELSE
                    -- enter a new sleep block
                    SET is_sleep = 1;
                    SET c_dur = 1;
                END IF;

            -- if ending a sleep block...
            ELSEIF is_sleep = 1 THEN
                SET is_sleep = 0;
                SET c_dur = 0;
            END IF;

        END IF;
    END WHILE;
    CLOSE cur;
    RETURN bt;

END !

CREATE FUNCTION wake_time (d DATE, uid BIGINT) RETURNS TIME DETERMINISTIC
BEGIN

    -- sleep task_id for user
    DECLARE tid BIGINT;
    -- tracks whether currently in a sleep block
    DECLARE is_sleep TINYINT DEFAULT 0;
    -- number of contiguous logged sleep entries in currently processed block
    DECLARE c_dur INT DEFAULT 0;
    -- largest length of block so far
    DECLARE max_dur INT DEFAULT 0;
    -- current candidate wake time
    DECLARE wt TIME DEFAULT '00:00:00';
    -- cursor variables
    DECLARE cur_ts TIMESTAMP;
    DECLARE cur_tid BIGINT;
    DECLARE done INT DEFAULT 0;
    DECLARE slept INT;

    DECLARE cur CURSOR FOR 
        SELECT log_time, task_id FROM user_task NATURAL JOIN
            (SELECT * FROM timelog
            WHERE log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d)) t
        WHERE user_id = uid
        ORDER BY log_time ASC;

    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
        SET done = 1;
    
    -- assume default sleep log symbol 'sl'
    SELECT task_id INTO tid FROM user_task 
        WHERE user_id = uid AND symbol = 'sl';

    -- if user didn't sleep at all, return NULL bedtime
    SELECT COUNT(*) INTO slept 
        FROM timelog 
        WHERE task_id = tid
        AND log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d);
    IF slept = 0 THEN
        RETURN NULL;
    END IF;

    OPEN cur;
    WHILE NOT done DO
        FETCH cur INTO cur_ts, cur_tid;
        IF NOT done THEN

            -- if sleep is logged...
            IF tid = cur_tid THEN

                -- if already in a sleep block...
                IF is_sleep = 1 THEN
                    -- extend length of current sleep block
                    SET c_dur = c_dur + 1;
                    -- check length against max length and update wake time
                    IF c_dur > max_dur THEN
                        SET max_dur = c_dur;
                        -- bump it by 30 minutes to reflect the logging standard
                        SET wt = cur_ts + INTERVAL 30 MINUTE;
                    END IF;

                -- if not in a sleep block...
                ELSE
                    -- enter a new sleep block
                    SET is_sleep = 1;
                    SET c_dur = 1;
                END IF;

            -- if ending a sleep block...
            ELSEIF is_sleep = 1 THEN
                SET is_sleep = 0;
                SET c_dur = 0;
            END IF;

        END IF;
    END WHILE;
    CLOSE cur;
    RETURN wt;

END !

-- Return sleep duration in minutes
CREATE FUNCTION sleep_duration (d DATE, uid BIGINT) RETURNS INT DETERMINISTIC
BEGIN
    -- sleep task_id for user
    DECLARE tid BIGINT;
    -- tracks whether currently in a sleep block
    DECLARE is_sleep TINYINT DEFAULT 0;
    -- number of contiguous logged sleep entries in currently processed block
    DECLARE c_dur INT DEFAULT 0;
    -- largest length of block so far
    DECLARE max_dur INT DEFAULT 0;
    -- cursor variables
    DECLARE cur_tid BIGINT;
    DECLARE done INT DEFAULT 0;
    DECLARE slept INT;

    DECLARE cur CURSOR FOR 
        SELECT task_id FROM user_task NATURAL JOIN
            (SELECT * FROM timelog
            WHERE log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d)) t
        WHERE user_id = uid
        ORDER BY log_time DESC;

    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
        SET done = 1;
    
    -- assume default sleep log symbol 'sl'
    SELECT task_id INTO tid FROM user_task 
        WHERE user_id = uid AND symbol = 'sl';

    -- if user didn't sleep at all, return NULL bedtime
    SELECT COUNT(*) INTO slept 
        FROM timelog 
        WHERE task_id = tid
        AND log_time BETWEEN get_noon(DATE_SUB(d, INTERVAL 1 DAY)) AND get_mn(d);
    IF slept = 0 THEN
        RETURN NULL;
    END IF;

    OPEN cur;
    WHILE NOT done DO
        FETCH cur INTO cur_tid;
        IF NOT done THEN
            -- if sleep is logged...
            IF tid = cur_tid THEN

                -- if already in a sleep block...
                IF is_sleep = 1 THEN
                    -- extend length of current sleep block
                    SET c_dur = c_dur + 1;
                    -- check length against max length
                    IF c_dur > max_dur THEN
                        SET max_dur = c_dur;
                    END IF;

                -- if not in a sleep block...
                ELSE
                    -- enter a new sleep block
                    SET is_sleep = 1;
                    SET c_dur = 1;
                END IF;

            -- if ending a sleep block...
            ELSEIF is_sleep = 1 THEN
                SET is_sleep = 0;
                SET c_dur = 0;
            END IF;

        END IF;
    END WHILE;
    CLOSE cur;
    -- assume default logging interval of 30 minutes
    RETURN max_dur * 30;
END !

-- Special UDF to calculate sleep goal via comparison with sleep_duration()
CREATE FUNCTION sleep_goal_met (d DATE, uid BIGINT) RETURNS TINYINT(1) DETERMINISTIC
BEGIN
    DECLARE slept_t INt;
    DECLARE pm INT;
    DECLARE goal_t INT;
    DECLARE tid BIGINT;
     -- assume default sleep log symbol 'sl'
    SELECT task_id INTO tid FROM user_task 
        WHERE user_id = uid AND symbol = 'sl';
    SELECT goal_time INTO goal_t FROM activity_key WHERE task_id = tid;
    SET slept_t = sleep_duration(d, uid);
    SET pm = SIGN(goal_t);
    IF pm = 0 THEN
        RETURN 1;
    ELSEIF pm * slept_t < goal_t THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END !



-- STORED PROCEDURES

-- Set up client user with basic tracking info:
    -- set up sleep tracking
        -- set 'sl' as default unchangeable sleep symbol in user_task
        -- set corresponding value in activity_key
    -- NOTE: do not use this when loading in sample data!
CREATE PROCEDURE setup_user (uid BIGINT)
BEGIN 
    INSERT INTO user_task (user_id, symbol)
        VALUES (uid, 'sl');

    INSERT INTO activity_key  
        VALUES (LAST_INSERT_ID(),  -- need this to retrieve task_id of added task
                'sleep', 
                'self-care', 
                'time spent asleep, including naps', 
                -9 * 60); -- set default 9 hour sleep goal   
END !


-- Set up activity tracking option with user-provided arguments

CREATE PROCEDURE setup_activity (uid BIGINT, s VARCHAR(10), 
                                 a VARCHAR(20), c VARCHAR(20), 
                                 d VARCHAR(100), g INT)
BEGIN
    INSERT INTO user_task (user_id, symbol)
        VALUES (uid, s);

    INSERT INTO activity_key
        VALUES (LAST_INSERT_ID(), a, c, d, g);
END !


CREATE PROCEDURE log_entry (uid BIGINT, s VARCHAR(10), ts TIMESTAMP)
BEGIN
    DECLARE tid BIGINT;
    
    SELECT task_id INTO tid FROM user_task 
        WHERE user_id = uid AND symbol = s;
    
    -- this insert handles not re-logging the exact same value, but does not 
    -- check if the user has entered another activity into this time slot
    INSERT INTO timelog (log_time, task_id) VALUES (ts, tid)
        ON DUPLICATE KEY UPDATE task_id = tid;
END !



-- TRIGGERS

-- Use stored procedure defined above to set up new user added by admin user
CREATE TRIGGER add_user AFTER INSERT
        ON user_info FOR EACH ROW
BEGIN
    CALL setup_user(NEW.user_id);
END !

-- Trigger to update audit_log and track when users perform actions
-- CREATE TRIGGER log_user_insert AFTER INSERT
-- BEGIN
--      to be implemented later
-- END !

DELIMITER ;




