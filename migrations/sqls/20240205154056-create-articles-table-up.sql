CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    views INT DEFAULT 0,
    cover VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
