-- File for Password Management section of Final Project

DROP FUNCTION IF EXISTS make_salt;
DROP FUNCTION IF EXISTS authenticate;
DROP PROCEDURE IF EXISTS sp_add_user;

-- (Provided) This function generates a specified number of characters for using as a
-- salt in passwords.
DELIMITER !
CREATE FUNCTION make_salt(num_chars INT) 
RETURNS VARCHAR(20) NOT DETERMINISTIC
BEGIN
    DECLARE salt VARCHAR(20) DEFAULT '';
    -- Don't want to generate more than 20 characters of salt.
    SET num_chars = LEAST(20, num_chars);
    -- Generate the salt!  Characters used are ASCII code 32 (space)
    -- through 126 ('z').
    WHILE num_chars > 0 DO
        SET salt = CONCAT(salt, CHAR(32 + FLOOR(RAND() * 95)));
        SET num_chars = num_chars - 1;
    END WHILE;
    RETURN salt;
END !
DELIMITER ;

-- Adds a new user to the user_info table, using the specified password (max
-- of 20 characters). Salts the password with a newly-generated salt value,
-- and then the salt and hash values are both stored in the table.
DELIMITER !
CREATE PROCEDURE sp_add_user (
    new_username VARCHAR(20), 
    user_password VARCHAR(20), 
    user_admin TINYINT(1))
BEGIN
    DECLARE user_salt CHAR(8);
    DECLARE hashed_pw BINARY(64);

    SET user_salt = make_salt(8);
    SET hashed_pw = SHA2(CONCAT(user_salt, user_password), 256);

    INSERT INTO user_info (username, salt, password_hash, is_admin)
        VALUES (new_username, user_salt, hashed_pw, user_admin);
END !
DELIMITER ;

-- Authenticates the specified username and password against the data
-- in the user_info table.  Returns 1 if the user appears in the table, and the
-- specified password hashes to the value for the user. Otherwise returns 0.
DELIMITER !
CREATE FUNCTION authenticate(login_un VARCHAR(20), login_pw VARCHAR(20))
RETURNS TINYINT DETERMINISTIC
BEGIN
    DECLARE hashed_pw BINARY(64);
    DECLARE user_salt CHAR(8);
    DECLARE user_pwh BINARY(64);

    SELECT salt INTO user_salt FROM user_info WHERE username = login_un;
    SELECT password_hash INTO user_pwh FROM user_info WHERE username = login_un;
    
    SET hashed_pw = SHA2(CONCAT(user_salt, login_pw), 256);
    IF hashed_pw = user_pwh THEN 
        RETURN 1;
    ELSE 
        RETURN 0;
    END IF;
END !
DELIMITER ;


-- look at my data... as me
CALL sp_add_user('aileen', 'azpw', 1);
-- this update statement is required to correctly load the test data
UPDATE user_info SET user_id = 1000 WHERE username = 'aileen';

-- admin user
CALL sp_add_user('testadmin', 'op', 1);
-- client user
CALL sp_add_user('testclient', 'nerfed', 0);


