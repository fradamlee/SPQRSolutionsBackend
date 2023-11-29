-- CREATE DATABASE spqrsolutions;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    user_name TEXT UNIQUE,
    photo_link TEXT,
    auth_provider VARCHAR(1) NOT NULL,
    hash_of_password TEXT NOT NULL
);

CREATE TABLE ips(
    id SERIAL PRIMARY KEY,
    clientIP TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE topics(
    id SERIAL PRIMARY KEY,
    title TEXT UNIQUE,
    color VARCHAR(7) UNIQUE
);

CREATE TABLE algos(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    about TEXT,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    t1 INT,
    t2 INT,
    t3 INT,
    FOREIGN KEY (t1) REFERENCES topics(id),
    FOREIGN KEY (t2) REFERENCES topics(id),
    FOREIGN KEY (t3) REFERENCES topics(id),
    likes INT,
    dislikes INT
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    belongs_to_algo_id INT NOT NULL,
    FOREIGN KEY (belongs_to_algo_id) REFERENCES algos(id) ON DELETE CASCADE,
    date_and_hour TIMESTAMP
);

CREATE TABLE votes(
    id SERIAL PRIMARY KEY,
    like_or_dislike BOOLEAN NOT NULL,
    voter_id INT NOT NULL,
    FOREIGN KEY (voter_id) REFERENCES users(id),
    algo_id_voted INT NOT NULL,
    FOREIGN KEY (algo_id_voted) REFERENCES algos(id) ON DELETE CASCADE,
    UNIQUE (voter_id, algo_id_voted)
);

-- Predefined topics
INSERT INTO topics (title, color) VALUES ('numerical series', '#ffb266');
INSERT INTO topics (title, color) VALUES ('diferential calculus', '#ff6026');
INSERT INTO topics (title, color) VALUES ('algebra', '#cccc00');
INSERT INTO topics (title, color) VALUES ('math games and riddles', '#cc6600');
INSERT INTO topics (title, color) VALUES ('varied games', '#ff66b2');
INSERT INTO topics (title, color) VALUES ('physics', '#00cccc');
INSERT INTO topics (title, color) VALUES ('AI  ', '#3333ff');
INSERT INTO topics (title, color) VALUES ('chemistry', '#ff6600');
INSERT INTO topics (title, color) VALUES ('electronics', '#a8cbe5');
INSERT INTO topics (title, color) VALUES ('probabilistics', '#99ff33');
INSERT INTO topics (title, color) VALUES ('stochastic processes', '#66ffb2');
INSERT INTO topics (title, color) VALUES ('trading and cryptocurrency', '#ff99cc');

CREATE VIEW users_public_data AS SELECT id, user_name, photo_link FROM users;

CREATE OR REPLACE FUNCTION update_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.like_or_dislike = TRUE THEN
    UPDATE algos
    SET likes = likes + 1
    WHERE id = NEW.algo_id_voted;
  ELSE
    UPDATE algos
    SET dislikes = dislikes + 1
    WHERE id = NEW.algo_id_voted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_algo_votes
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes();

-----
CREATE OR REPLACE FUNCTION revoke_votes() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.like_or_dislike = true THEN
    UPDATE algos SET likes = likes - 1 WHERE id = OLD.algo_id_voted;
  ELSE
    UPDATE algos SET dislikes = dislikes - 1 WHERE id = OLD.algo_id_voted;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revoke_algo_votes
AFTER DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION revoke_votes();