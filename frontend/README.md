# Student Management - FRONTEND (HTML / CSS / JavaScript)

Plain static files. No build step. It talks ONLY to the API Gateway (http://localhost:8080).

## Run
1. Start the backend services first (see ../README.md for the order).
2. Serve this folder on port 5500, for example:
   - `python -m http.server 5500`  (run inside this folder)
   - or VS Code "Live Server" -> Open with Live Server (port 5500)
3. Open http://localhost:5500

Do NOT double-click the HTML files (file://). The browser then sends origin "null" and the gateway's CORS rule blocks it.

## Gateway address
`js/api.js`, first line: `const API_BASE = 'http://localhost:8080';`
