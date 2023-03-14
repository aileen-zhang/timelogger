-- DDL tables for timelog app

-- Remove all tables when setting up from scratch
DROP TABLE IF EXISTS -- TODO




-- Represents possible categories of activity as reference relation
    -- NOTE: this table can only be changed by the admin user
CREATE TABLE category (
    -- fixed list of categories determined at database setup
    category_name   VARCHAR(20) PRIMARY KEY,
    -- category description displayed to user when prompting for new activity
    category_desc   VARCHAR(100) NOT NULL
);

-- Represents a mapping of auto-generated task_id to user-chosen logging symbol
CREATE TABLE user_task (
    task_id     -- autoincrement primary key
    -- same user_id auto-generated in user_info
    user_id     -- autoincrement INT type
    -- symbol entered by the user when actually logging entries
    symbol      VARCHAR(10) NOT NULL,
    FOREIGN KEY user_id REFERENCES user_info(user_id)
);

-- Represents a mapping of generated task id to type of activity
    -- Required attributes: id, name, category
    -- Optional attributes: description, display information, goal time
CREATE TABLE activity_key (
    task_id         -- autoincrement primary key
    -- user-provided name for activity
    activity_name   VARCHAR(20) NOT NULL,
    -- user-selected category for activity
    category_name   VARCHAR(20) NOT NULL,
    -- optional user-provided short description of task
    activity_desc   VARCHAR(100),
    -- optional goal_time in minutes
        -- 0 if no goal is set, 
        -- negative if goal is to exceed the time (e.g. exercise goal)
        -- positive if goal is to not meet the time (e.g. max screen time)
    goal_time       INT DEFAULT 0
    FOREIGN KEY task_id REFERENCES user_task(task_id),
    FOREIGN KEY category_name REFERENCES category(category_name)
);

-- Represents a timestamp with a corresponding entry symbol
-- Optional attributes: 
CREATE TABLE timelog (
    log_time    TIMESTAMP PRIMARY KEY,
    task_id     -- INT type of autoincrement

    note        VARCHAR(100)
    exclude     BOOLEAN DEFAULT FALSE
    FOREIGN KEY (symbol) REFERENCES key(symbol)
);

-- Represents audit log of when users add or remove data
CREATE TABLE audit_log (

);

