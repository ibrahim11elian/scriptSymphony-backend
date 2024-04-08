```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);
```

```sql
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
```

```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(255) NOT NULL,
    article_id INT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
```
