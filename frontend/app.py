import streamlit as st
import requests
import pandas as pd
import base64
import os

# --- Configurations ---
API_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api/v1/recommend")

st.set_page_config(
    page_title="Iron & Aesthetic | AI Gym",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- Session State ---
if 'show_form' not in st.session_state:
    st.session_state.show_form = False
if 'results_ready' not in st.session_state:
    st.session_state.results_ready = False
if 'results_data' not in st.session_state:
    st.session_state.results_data = None

def get_base64_of_bin_file(bin_file):
    with open(bin_file, 'rb') as f:
        data = f.read()
    return base64.b64encode(data).decode()

# --- Background CSS ---
bg_image_path = os.path.join(os.path.dirname(__file__), "assets", "bg.png")
if os.path.exists(bg_image_path):
    bin_str = get_base64_of_bin_file(bg_image_path)
    page_bg_img = f'''
    <style>
    .stApp {{
        background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url("data:image/png;base64,{bin_str}");
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }}
    </style>
    '''
    st.markdown(page_bg_img, unsafe_allow_html=True)

# --- Main Custom CSS ---
st.markdown("""
<style>
    /* Global Colors */
    .stApp { color: #FAFAFA; }
    h1, h2, h3, h4 { color: #00FFcc !important; font-family: 'Inter', sans-serif; }
    
    /* Hero Title styling */
    .hero-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding-top: 5rem;
        padding-bottom: 2rem;
    }
    .hero-title {
        font-size: 5rem;
        font-weight: 900;
        background: -webkit-linear-gradient(45deg, #00C9FF, #92FE9D);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
        line-height: 1.1;
    }
    .hero-subtitle {
        font-size: 1.5rem;
        color: #E0E0E0;
        max-width: 600px;
        margin-bottom: 2rem;
    }
    
    /* Inputs */
    div[data-baseweb="select"] > div, div[data-baseweb="input"] > div {
        background-color: rgba(20, 22, 28, 0.8);
        border: 1px solid #333 !important;
        border-radius: 8px !important;
        color: white !important;
    }
    
    /* Buttons */
    button[kind="primary"] {
        background: linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%);
        border: none;
        color: #111 !important;
        font-weight: 800;
        border-radius: 8px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    button[kind="primary"]:hover {
        transform: scale(1.02);
        box-shadow: 0 0 15px rgba(0, 201, 255, 0.5);
    }
    
    /* Hide default streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    [data-testid="collapsedControl"] {display: none;}
</style>
""", unsafe_allow_html=True)

# --- 1. Top Section (Always visible) ---
# We add an ID to the top so we can scroll back to it using an HTML anchor later
st.markdown("<div id='top'></div>", unsafe_allow_html=True)

col1, col2, col3 = st.columns([1, 6, 1])
with col2:
    st.markdown('''
    <div class="hero-container">
        <div class="hero-title">ELEVATE YOUR<br>PERFORMANCE</div>
        <div class="hero-subtitle">Harness the power of Machine Learning to generate hyper-personalized workout routines and nutritional targets instantly.</div>
    </div>
    ''', unsafe_allow_html=True)
    
    # Show 'Start' button only if form is not yet shown
    if not st.session_state.show_form:
        st.write("")
        btn_col1, btn_col2, btn_col3 = st.columns([2, 1, 2])
        with btn_col2:
            if st.button("▶ START YOUR JOURNEY", type="primary", use_container_width=True):
                st.session_state.show_form = True
                st.rerun()

# --- 2. Results Section (Shown immediately if available, above the form) ---
if st.session_state.results_ready and st.session_state.results_data:
    st.divider()
    
    # Auto-scroll trick using Javascript injected via Streamlit components
    # This fires when the page renders with results_ready = True
    st.components.v1.html(
        """
        <script>
            window.parent.document.getElementById('top').scrollIntoView({behavior: 'smooth'});
        </script>
        """,
        height=0
    )

    st.success("✨ Plan Generated Successfully!")
    data = st.session_state.results_data
    
    st.markdown("### 🎯 Your Target Calories")
    st.info(f"**{data['target_calories']} kcal/day** to achieve your target weight.")
    
    st.markdown("### ⚡ Your AI-Recommended Routine")
    workout_df = pd.DataFrame(data['workout_plan'])
    workout_df.columns = ["Exercise", "Sets", "Reps", "Target Muscle"]
    st.dataframe(workout_df, use_container_width=True, hide_index=True)
    st.write("")

# --- 3. Form Section (Shown after clicking 'Start') ---
if st.session_state.show_form:
    st.divider()
    st.markdown("### 📋 Enter Your Details")
    
    with st.container():
        fcol1, fcol2, fcol3 = st.columns(3)
        
        with fcol1:
            age = st.number_input("Age", min_value=12, max_value=100, value=22)
            gender = st.selectbox("Gender", ["male", "female"])
            weight_kg = st.number_input("Weight (kg)", min_value=30.0, max_value=200.0, value=70.0)
            height_cm = st.number_input("Height (cm)", min_value=100.0, max_value=250.0, value=175.0)

        with fcol2:
            activity_level = st.selectbox(
                "Activity Level", 
                ["sedentary", "light", "moderate", "active", "very_active"]
            )
            goal = st.selectbox(
                "Fitness Goal", 
                ["lose", "maintain", "gain"]
            )

        with fcol3:
            diet_preference = st.selectbox("Diet Type", ["omnivore", "vegan", "keto", "vegetarian"])
            location = st.selectbox("Workout Location", ["gym", "home"])

    st.write("")
    submit_btn = st.button("Generate My AI Plan", type="primary", use_container_width=True)

    if submit_btn:
        payload = {
            "age": age, "gender": gender, "weight_kg": weight_kg, "height_cm": height_cm,
            "activity_level": activity_level, "goal": goal, "diet_preference": diet_preference,
            "location": location
        }

        with st.spinner("Crunching the numbers..."):
            try:
                response = requests.post(API_URL, json=payload)
                if response.status_code == 200:
                    st.session_state.results_data = response.json()
                    st.session_state.results_ready = True
                    # Re-run after fetching data to trigger scroll to top and render results block
                    st.rerun()
                else:
                    st.error(f"Backend Error: {response.text}")
                    st.session_state.results_ready = False
            except requests.exceptions.ConnectionError:
                st.error("🚨 Could not connect to the API. Is FastAPI running on port 8000?")
                st.session_state.results_ready = False