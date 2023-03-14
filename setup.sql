-- DDL tables for timelog app

-- Create and use database
CREATE DATABASE IF NOT EXISTS timelogdb;
USE timelogdb;

-- Remove all tables when setting up from scratch
DROP TABLE IF EXISTS timelog;
DROP TABLE IF EXISTS activity_key;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user_task;
DROP TABLE IF EXISTS user_info;

-- This table holds information for authenticating users based on
-- a password. Passwords are not stored plaintext so that they
-- cannot be used by people that shouldn't have them.
CREATE TABLE user_info (
    user_id         SERIAL PRIMARY KEY,
    -- Usernames are up to 20 characters.
    username        VARCHAR(20) NOT NULL,
    -- Salt will be 8 characters all the time, so we can make this 8.
    salt            CHAR(8), -- NOT NULL,
    -- We use SHA-2 with 256-bit hashes.  MySQL returns the hash
    -- value as a hexadecimal string, which means that each byte is
    -- represented as 2 characters.  Thus, 256 / 8 * 2 = 64.
    -- We can use BINARY or CHAR here; BINARY simply has a different
    -- definition for comparison/sorting than CHAR.
    password_hash   BINARY(64) -- NOT NULL,
    -- is_admin        -- TODO!
);


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
    task_id     SERIAL PRIMARY KEY,
    -- same user_id auto-generated in user_info
    user_id     BIGINT UNSIGNED NOT NULL,
    -- symbol entered by the user when actually logging entries
    symbol      VARCHAR(10) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);

-- Represents a mapping of generated task id to type of activity
    -- Required attributes: id, name, category
    -- Optional attributes: description, display information, goal time
CREATE TABLE activity_key (
    task_id         BIGINT UNSIGNED PRIMARY KEY,
    -- user-provided name for activity
    activity_name   VARCHAR(20) NOT NULL,
    -- user-selected category for activity
    category_name   VARCHAR(20) NOT NULL,
    -- optional user-provided short description of task
    activity_desc   VARCHAR(100),
    -- optional goal_time in minutes
        -- 0 if no goal is set
        -- negative if goal is to exceed the time (e.g. exercise goal)
        -- positive if goal is to not meet the time (e.g. max screen time)
    goal_time       INT NOT NULL DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES user_task(task_id),
    FOREIGN KEY (category_name) REFERENCES category(category_name)
);

-- Represents a timestamp with a corresponding entry symbol
-- Optional attributes: 
CREATE TABLE timelog (
    log_time    TIMESTAMP PRIMARY KEY,
    task_id     BIGINT UNSIGNED NOT NULL,
    note        VARCHAR(100),
    exclude     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES user_task(task_id)
);

-- Represents audit log of when users add or remove data
-- CREATE TABLE audit_log (

-- );

