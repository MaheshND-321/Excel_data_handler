# Excel Data Handler App 📊📧

A full-stack web application that allows users to upload restaurant order data in Excel/CSV format, view and filter the records, edit them inline, download filtered data, and send daily summaries via email to a specified address.

---

## 🛠 Tech Stack

- **Frontend:** ReactJS (Vite)
- **Backend:** Flask (Python)
- **Deployment:** Render.com

---

## 🚀 Features

- 📤 Upload restaurant order data (Excel/CSV)
- 📄 Display and filter order records (e.g., by date or restaurant)
- ✏️ Edit records directly from the UI
- 📥 Download filtered data as CSV
- 🗑️ Delete filtered records
- 📧 Send daily reports to a user-entered email
- 🔁 Reset data to initial state

---

## 📁 Folder Structure

project-root/
│
├── backend/ # Flask backend (API logic, file handling, emailing)
│ ├── app.py # Main Flask app
│ ├── routes/ # API routes
│ └── ...
│
├── frontend/ # React Vite frontend
│ ├── src/
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── components/
│ ├── public/
│ ├── .env
│ └── ...



---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/excel-data-handler-app.git
cd excel-data-handler-app
## 2. Backend Setup (Flask)

cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run the Flask app
python app.py

## 3. Frontend Setup (React + Vite)

cd frontend
npm install

# Create .env file in /frontend
VITE_API_BASE_URL=http://localhost:5000

# Run the frontend
npm run dev


## Deployment on Render

Backend (Flask API)
Create a new Web Service on Render.

Set the root directory as /backend.

Set build and start commands:

Frontend (React App)
Create a new Static Site on Render.

Set the root directory as /frontend.

Set the build command:

## Email Summary
Users can input an email address, and the app will send the filtered data directly to that address using the backend email functionality.




