SCENEPASS LEEDS - SETUP AND RUN INSTRUCTIONS

Follow these steps to get the application running on your local machine.

---
PREREQUISITES
---
1. Node.js (v18 or higher) & npm
2. Python (v3.8 or higher)
3. MongoDB (running locally on default port 27017)

---
STEP 1: BACKEND SETUP (FLASK)
---
1. Open a new terminal and navigate to the backend directory:
   cd backend

2. Create a virtual environment:
   python -m venv venv

3. Activate the virtual environment:
   .\venv\Scripts\activate

4. Install the required Python packages:
   pip install -r requirements.txt

5. Start the backend server:
   python app.py

The backend will be running at http://localhost:5000

---
STEP 2: FRONTEND SETUP (REACT)
---
1. Open a SECOND terminal and navigate to the frontend directory:
   cd frontend

2. Install the required Node packages:
   npm install

3. Start the development server:
   npm run dev

The frontend will be running at http://localhost:5173 (or as shown in your terminal).

---
STEP 3: INITIAL DATA (OPTIONAL)
---
If the event list is empty, you can trigger a manual sync:
- The backend automatically syncs every 24 hours.
- To sync manually, you can run: python sync_theatres.py (inside the backend folder with venv active).

---
TROUBLESHOOTING
---
- Ensure MongoDB is running before starting the backend.
- If you see "CORS" errors, verify that the backend is running on port 5000 and the frontend on port 5173.
- Check the console logs in both terminals for specific error messages.
