CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(255) NOT NULL,
    article_id INT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
