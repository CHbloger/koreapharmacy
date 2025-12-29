# 🏥 Korea Pharmacy Finder for Foreigners

A full-stack project that collects pharmacy information from the South Korean Public Data Portal (data.go.kr), translates it into English, and visualizes it on an interactive map. This service is designed to help foreigners in Korea find pharmacies, check operating hours, and get directions easily.

![Project Status](https://img.shields.io/badge/Status-Active-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FJS%2FLeaflet-orange)

## ✨ Features

### 🐍 Backend (Data Collection)
*   **API Integration**: Fetches real-time pharmacy data from the **National Emergency Medical Center** and **HIRA** APIs.
*   **Automatic Translation**: Uses `googletrans` to translate pharmacy names and addresses from Korean to English.
*   **Data Processing**: Extracts key details: Name, Address, Phone, Coordinates, and Weekly Operating Hours.
*   **Robustness**: Handles different API field naming conventions (`dutyName` vs `yadmNm`) and translation errors gracefully.

### 🌐 Frontend (Web Visualization)
*   **Interactive Map**: Full-screen map using **Leaflet.js** and OpenStreetMap.
*   **User Geolocation**: "Current Location" button to center the map on the user.
*   **Search Functionality**: Filter pharmacies by English name, Korean name, or address.
*   **Smart Status**: Real-time "Open" or "Closed" badges based on current time and operating hours.
*   **Responsive Design**: Mobile-friendly UI using **Bootstrap 5**, with a "Medical" green theme.
*   **AdSense & SEO**: Integrated slots for Google AdSense and SEO meta tags optimized for English search terms.

## 🛠️ Tech Stack

*   **Backend**: Python 3, Requests, Googletrans (v4.0.0rc1)
*   **Frontend**: HTML5, CSS3, Vanilla JavaScript
*   **Libraries**: Bootstrap 5, Leaflet.js, FontAwesome

## 🚀 Getting Started

### Prerequisites
*   Python 3.x installed.
*   An API Service Key from [data.go.kr](https://www.data.go.kr/).
    *   Recommended API: *National Emergency Medical Center - Pharmacy Info Service (국립중앙의료원_전국 약국 정보 조회 서비스)*

### 1. Backend Setup (Data Collection)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/korea-pharmacy-finder.git
    cd korea-pharmacy-finder
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Alternatively:* `pip install requests deep-translator`

3.  **Configure API Key**:
    *   Open `collect_data.py`.
    *   Replace `'YOUR_API_KEY'` with your actual decoded Service Key.
    ```python
    API_KEY = 'your_actual_service_key_here'
    ```

4.  **Run the script**:
    ```bash
    python collect_data.py
    ```
    *   This will generate a `pharmacy_data.json` file in the root directory.
    *   *Note: The script defaults to fetching 5 rows for testing. Modify `num_of_rows` in the code to fetch more data.*

### 2. Frontend Setup (Visualization)

The frontend is a static site that reads the generated `pharmacy_data.json`.

1.  **Serve the files**:
    *   Due to browser security policies (CORS), you cannot open `index.html` directly from the file explorer. You must use a local web server.

    ```bash
    # Using Python's built-in server
    python -m http.server 8000
    ```

2.  **Access the site**:
    *   Open your browser and go to `http://localhost:8000`.

## 📂 Project Structure

```
korea-pharmacy-finder/
├── collect_data.py      # Python script to fetch and process API data
├── pharmacy_data.json   # Output data file (generated)
├── index.html           # Main frontend entry point
├── styles.css           # Custom styling
├── app.js               # Frontend logic (Map, Search, Popups)
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## 📢 SEO & Ads

*   **SEO**: The project includes meta tags for keywords like "Pharmacy in Seoul", "English speaking pharmacy", and Open Graph tags for social sharing.
*   **AdSense**: Placeholder slots are configured in the Header, Footer, and Marker Popups. To enable ads, replace the comments in `index.html` and `app.js` with your Google AdSense code.

## 📄 License

This project is open-source.

## 🙏 Credits

*   **Data Source**: [Korea Public Data Portal (data.go.kr)](https://www.data.go.kr/)
*   **Map Provider**: [OpenStreetMap](https://www.openstreetmap.org/)
