from flask import Flask, request, render_template, session, redirect
import sqlite3

app = Flask(__name__)
app.secret_key = 'ctf_prototype_key'

def get_db():
    return sqlite3.connect('ctf.db')

# LEVEL 1 - Basic SQLi
@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
        
        db = get_db()
        result = db.execute(query).fetchone()
        db.close()
        
        if result:
            session['level1_passed'] = True
            return redirect('/level2')
        else:
            error = "Invalid credentials. Keep trying..."
    
    return render_template('login.html', error=error)

# LEVEL 2 - Filter bypass SQLi
@app.route('/level2', methods=['GET', 'POST'])
def level2():
    if not session.get('level1_passed'):
        return redirect('/')
    
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Filter blocks OR but nothing else
        if 'or' in username.lower() or 'or' in password.lower():
            error = "Nice try... I'm filtering that out 😏"
            return render_template('level2.html', error=error)

        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"

        db = get_db()
        result = db.execute(query).fetchone()
        db.close()

        if result:
            session['logged_in'] = True
            return redirect('/admin')
        else:
            error = "Still not good enough. Think differently..."

    return render_template('level2.html', error=error)

# ADMIN - Flag page
@app.route('/admin')
def admin():
    if not session.get('logged_in'):
        return redirect('/')
    
    db = get_db()
    flag = db.execute("SELECT flag FROM flags WHERE id=1").fetchone()[0]
    db.close()
    
    return render_template('admin.html', flag=flag)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)