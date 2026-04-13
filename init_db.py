import sqlite3

conn = sqlite3.connect('ctf.db')
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
)''')

c.execute('''CREATE TABLE IF NOT EXISTS flags (
    id INTEGER PRIMARY KEY,
    flag TEXT
)''')

c.execute("INSERT INTO users VALUES (1, 'admin', 'supersecret123')")
c.execute("INSERT INTO flags VALUES (1, 'FLAG{SQL_BYPASS_SUCCESS}')")

conn.commit()
conn.close()
print("Database initialized!")