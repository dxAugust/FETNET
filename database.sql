CREATE TABLE users (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT,
    accessToken TEXT (255),
    username    TEXT (40),
    email       TEXT (255),
    password    TEXT (255),
    reg_ip      TEXT (255),
    reg_date    TEXT (255),
    last_online TEXT (255),
    partner     INT (10),
    role        TEXT (255),
    status      TEXT (1024),
    mood        TEXT (255),
    banned_date TEXT (255) 
);

CREATE TABLE subscription (
    id         INTEGER    PRIMARY KEY AUTOINCREMENT,
    sub_id     INT (255),
    belongs_id INT (255),
    sub_date   TEXT (255) 
);