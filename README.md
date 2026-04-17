# ClauseWatch 🔍

**ClauseWatch** is an open-source, AI-powered monitor that watches Terms of Service agreements (or any webpage) and explains changes in plain English.

Companies change their terms and privacy policies constantly, often burying critical updates in complex legal jargon. ClauseWatch automatically detects when a webpage changes, diffs the text, and uses a free LLM to tell you exactly what changed, whether you should care, and how serious the impact is.

---

## ✨ Features

* **Automated Monitoring:** Runs silently in the background and checks your saved URLs daily.
* **AI Translation:** Converts dense legal jargon into short, plain-English summaries.
* **Impact Scoring:** Rates every change on a scale of 1 to 10 so you know immediately if it is a major privacy risk or just a typo fix.
* **Local Database:** Uses a lightweight `database.json` system to remember your tracked URLs across server restarts.
* **100% Free AI:** Configured out-of-the-box to use OpenRouter's free Mistral 7B model—meaning zero API costs.
* **Privacy First:** All your tracked URLs and data stay local to your machine.

---

## 🛠️ Prerequisites

Before you install ClauseWatch, ensure you have the following on your machine:
* [Node.js](https://nodejs.org/) installed.
* A free API key from [OpenRouter](https://openrouter.ai/).

---

## 🚀 Quick Start Guide

Follow these steps to get ClauseWatch running on your local machine in under 2 minutes.

### 1. Clone the Repository
Open your terminal and clone this project to your computer:
```bash
git clone [https://github.com/jenadebabrata/clausewatch.git](https://github.com/jenadebabrata/clausewatch.git)
cd clausewatch
```
### 2. Install Dependencies
Install the required Node.js packages (Express, Axios, Node-cron, and Dotenv):
```bash
npm install
```
### 3. Setup Your Secure API Key
To keep your credentials secure, ClauseWatch uses environment variables. You must create your own .env file.

Create a new file in the root folder and name it exactly .env

Paste the following text into it, replacing the placeholder with your actual OpenRouter key:
OPENAI_API_KEY=your-openrouter-key-here
OPENAI_BASE_URL=[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)

**example:OPENAI_API_KEY=YOUR_API_KEY
OPENAI_BASE_URL=https://openrouter.ai/api/v1
mistralai/mistral-7b-instruct:free**

**(Note: Your .env file is ignored by Git, so your key will never be uploaded to the internet).**
Make a **.gitignore** file by any notepad pest below on it: (file name only .gitignore and set file type to all && best for making on VSCODE)
"".env
node_modules/
database.json""

### 4. Start the Server
Run the application:
```bash
node index.js
```

Open your browser and navigate to: **http://localhost:3000**

### 💻 How to Use ClauseWatch
Add a Contract: On the web interface, paste the URL of a terms of service page (e.g., https://www.netflix.com/termsofuse) and give it a label.

Background Checking: ClauseWatch will automatically ping the URL every day at 9:00 AM.

Manual Override: Click the "Check All URLs Now" button to force an immediate check.

View Changes: If a change is detected, the dashboard card will turn red and display the AI's plain-English summary of what was altered.

### 🧪 Developer Testing Hack
Want to see the AI work without waiting for a company to change their terms?

Add a webpage to your watchlist.

Open your database.json file.

Find your URL and manually edit the originalText field to something fake (e.g., **"By using this service, you agree to pay $500/month**.").

Go to the web app and click Check All URLs Now. The app will detect the "change" and generate an AI summary instantly!

### 🏗️ Architecture & Tech Stack
ClauseWatch is built to be intentionally lightweight and easy for beginner to intermediate developers to modify.

Backend: **Node.js with Express.js**

Web Scraping: Axios (for HTTP requests) and Regex (for HTML stripping)

Task Scheduling: Node-cron

AI Engine: **Mistral-7B via the OpenRouter API**

Storage: Local JSON File System (fs)

### 🤝 Contributing
Contributions, issues, and feature requests are welcome! If you want to make ClauseWatch better, feel free to fork this repository and submit a Pull Request.

Ideas for future features:

**Email or Discord webhook notifications when a change is detected.

Support for PDF contract parsing.

Adding user authentication for cloud deployment.
**

