import pandas as pd
import os
import joblib
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("DATA_PATH", os.path.join(BASE_DIR, 'data', 'megaGymDataset.csv'))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_pipeline', 'models')

def train_model():
    print("Loading large dataset...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Error: Could not find dataset at {DATA_PATH}")
        return

    # 1. Clean the Data
    features = ['BodyPart', 'Equipment', 'Level']
    df = df.dropna(subset=['Title'])
    
    for col in features:
        df[col] = df[col].fillna('Unknown')
        # CRITICAL FIX: Convert strings and force standard object type 
        # to prevent StringDtype pickling errors in joblib
        df[col] = df[col].astype(str).str.lower().astype(object)

    # 2. Extract Values explicitly as a Numpy Array (Strips away Pandas entirely)
    print("Encoding features...")
    # By passing df[features].values, scikit-learn only sees raw python arrays
    X = df[features].values 
    
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoded_features = encoder.fit_transform(X)

    # 3. Train the Model
    print("Training KNN Recommender...")
    model = NearestNeighbors(n_neighbors=5, metric='cosine')
    model.fit(encoded_features)

    # 4. Save Artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    joblib.dump(model, os.path.join(MODEL_DIR, 'knn_model.pkl'))
    joblib.dump(encoder, os.path.join(MODEL_DIR, 'encoder.pkl'))
    
    # Save lookup as CSV
    lookup_df = df[['Title', 'BodyPart', 'Equipment', 'Level']]
    lookup_df.to_csv(os.path.join(MODEL_DIR, 'exercise_db.csv'), index=False)

    print(f"Success! Model trained on {len(df)} exercises and saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_model()