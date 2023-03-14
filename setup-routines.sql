-- UDFs, stored procedures, and triggers for timelog app

-- UDFs:
    -- daily_time(date, task_id)
    -- goal_met(date, task_id)
    -- bedtime(date, user_id)
    -- wake_time(date, user_id)
    -- sleep_duration(date, user_id)
    -- sleep_goal_met(date, user_id)
-- Stored procedures:
    -- setup_user...
-- Triggers:
    -- 

DELIMITER !

--------------------------------------------------------------------------------

-- Calculate how much time was spent on one activity on the specified date
    -- NOTE: day defined as 24 hours after midnight of given date
CREATE FUNCTION daily_time (d DATE, task_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- count number of entries of task_id in the 24 hours after midnight of date
    -- multiply by 30 for number of minutes
    -- TODO STUFF GOES HERE!

END !

-- Calculate if goal for a given task was met on a given day (24 hours)
    -- [signum(goal_time) * (daily_time(task_id) - abs(goal_time))] >= 0
    -- NOTE: sleep goal calculated separately below
CREATE FUNCTION goal_met (d DATE, task_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- TODO compare result of daily_time() with entry in activity_key()

END !


-- Calculate sleep stats of a given date via the following algorithms:
    
    -- BEDTIME is calculated as the date-agnostic time at the beginning of the 
    -- longest block of near-contiguous sleep entries (no more than an hour 
    -- break between sections) ending before midnight on the next day
    
    -- WAKE TIME is calculated as end of near-contiguous sleep entries ending on 
    -- the given day, possibly starting on the previous day
   
    -- SLEEP DURATION is calculated as the number of sleep entries between the
    -- bedtime of that day and the wake time of the next day

-- EXAMPLE SLEEP LOG VALUES:
    -- SLEEP START | SLEEP END
    ----------------------------
    -- 1/1: 2 AM   | 1/1: 10 AM 
    -- 1/1: 11 PM  | 1/2: 8 AM
    -- 1/2: 1 PM   | 1/2: 3 PM  -- NAP: not counted in sleep
    -- 1/3: 12 AM  | 1/3: 7 AM
    -- 1/3: 8 AM   | 1/3: 10 AM -- SLEEP: <= 1 hour break from prev sleep

-- EXAMPLE RESULTS:
    -- DATE  | BEDTIME | WAKE TIME | SLEEP DURATION
    ------------------------------------------------
    -- 12/31 | 2 AM    | N/A       | 8 HRS
    -- 1/1   | 11 PM   | 10 AM     | 9 HRS
    -- 1/2   | 12 AM   | 8 AM      | 7 + 2 HRS
    -- 1/3   | N/A     | 10 AM     | N/A

CREATE FUNCTION bedtime (d DATE, user_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- TODO implement hellish algorithm above

END !

CREATE FUNCTION wake_time (d DATE, user_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- TODO implement hellish algorithm above

END !

CREATE FUNCTION sleep_duration (d DATE, user_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- TODO implement hellish algorithm above

END !

-- Special UDF to calculate sleep goal via comparison with sleep_duration()
    -- NOTE: should handle positive goal_time if the user is a freak who wants
    -- to sleep *less* than some goal amount
CREATE FUNCTION sleep_goal_met (d DATE, user_id TODO) RETURNS -- SOMETHING!
BEGIN

    -- TODO implement hellish algorithm above

END !

--------------------------------------------------------------------------------

-- Set up client user with basic tracking info:
    -- insert user into user_info table
    -- set up sleep tracking
        -- set 'sl' as default unchangeable sleep symbol in user_task
        -- set corresponding value in activity_key
    
    -- NOTE: do not use this when loading in sample data!
CREATE PROCEDURE setup_user(
    user_id     -- TODO INT type of autoincrement
)
BEGIN 
    -- TODO STUFF HERE!
END !

-- Stored procedure to ???


--------------------------------------------------------------------------------

-- Trigger to update audit_log and track when users perform actions
CREATE TRIGGER log_user_action AFTER -- TODO!!
BEGIN
    -- TODO!!!
END !





DELIMITER ;




