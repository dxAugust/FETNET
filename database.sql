CREATE TABLE users (
    id          INTEGER         PRIMARY KEY AUTOINCREMENT,
    accessToken TEXT (255),
    username    TEXT (40),
    email       TEXT (255),
    password    TEXT (255),
    reg_ip      TEXT (255),
    reg_date    TEXT (255),
    last_online TEXT (255),
    partner     INT (10),
    mood        TEXT (100, 100),
    admin       INT (10),
    sub_until   TEXT,
    name_color  TEXT
);

CREATE TABLE subscriptions (
    id         INTEGER    PRIMARY KEY AUTOINCREMENT,
    sub_id     INT (255),
    belongs_id INT (255),
    sub_date   TEXT (255) 
);

CREATE TABLE bans (
    id        INT (255)    PRIMARY KEY,
    banned_ip INT (255),
    banned_id INT (255),
    date      STRING (255),
    until     STRING (255),
    admin_id  INT (255),
    place     TEXT,
    reason    TEXT
);