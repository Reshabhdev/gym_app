import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'ml_pipeline', 'models')

def build_unified_exercise_dataset():
    print("Building unified exercise dataset...")
    dfs = []
    
    # 1. megaGymDataset.csv & megaGymDataset 2.csv
    for filename in ['megaGymDataset.csv', 'megaGymDataset 2.csv']:
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            df = pd.read_csv(path)
            if 'Title' in df.columns:
                sub_df = df[['Title', 'BodyPart', 'Equipment', 'Level']].copy()
                dfs.append(sub_df)

    # 2. Workout.csv
    workout_path = os.path.join(DATA_DIR, 'Workout.csv')
    if os.path.exists(workout_path):
        df = pd.read_csv(workout_path)
        sub_df = pd.DataFrame()
        sub_df['Title'] = df['Workout']
        sub_df['BodyPart'] = df['Body Part']
        sub_df['Equipment'] = 'Unknown'
        sub_df['Level'] = 'Unknown'
        dfs.append(sub_df)

    # 3. gym_exercise_dataset.csv
    gym_ex_path = os.path.join(DATA_DIR, 'gym_exercise_dataset.csv')
    if os.path.exists(gym_ex_path):
        df = pd.read_csv(gym_ex_path)
        sub_df = pd.DataFrame()
        sub_df['Title'] = df['Exercise Name']
        sub_df['BodyPart'] = df['Target_Muscles']
        sub_df['Equipment'] = df['Equipment']
        
        # Map difficulty to level
        def map_difficulty(d):
            try:
                d = float(d)
                if d <= 2: return 'Beginner'
                if d == 3: return 'Intermediate'
                return 'Expert'
            except:
                return 'Unknown'
                
        if 'Difficulty (1-5)' in df.columns:
            sub_df['Level'] = df['Difficulty (1-5)'].apply(map_difficulty)
        else:
            sub_df['Level'] = 'Unknown'
            
        dfs.append(sub_df)

    if not dfs:
        raise ValueError("No exercise datasets found!")

    unified_df = pd.concat(dfs, ignore_index=True)
    unified_df = unified_df.dropna(subset=['Title'])
    unified_df = unified_df.drop_duplicates(subset=['Title'])
    
    # Fill NAs
    for col in ['BodyPart', 'Equipment', 'Level']:
        unified_df[col] = unified_df[col].fillna('Unknown')
        unified_df[col] = unified_df[col].astype(str).str.lower().astype(object)

    return unified_df

def train_exercise_recommender(df):
    print("Training Unified KNN Recommender...")
    features = ['BodyPart', 'Equipment', 'Level']
    X = df[features].values 
    
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoded_features = encoder.fit_transform(X)

    model = NearestNeighbors(n_neighbors=5, metric='cosine')
    model.fit(encoded_features)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, 'knn_model.pkl'))
    joblib.dump(encoder, os.path.join(MODEL_DIR, 'encoder.pkl'))
    
    lookup_df = df[['Title', 'BodyPart', 'Equipment', 'Level']]
    lookup_df.to_csv(os.path.join(MODEL_DIR, 'exercise_db.csv'), index=False)
    print(f"Success! Exercise Recommender trained on {len(df)} exercises.")

def build_unified_user_dataset():
    print("Building unified user profiles dataset...")
    dfs = []
    
    # gym recommendation.xlsx
    rec_path = os.path.join(DATA_DIR, 'gym recommendation.xlsx')
    if os.path.exists(rec_path):
        df = pd.read_excel(rec_path)
        sub_df = pd.DataFrame()
        sub_df['Age'] = df['Age']
        sub_df['Gender'] = df['Sex'].astype(str).str.lower()
        sub_df['Weight'] = df['Weight']
        sub_df['Height'] = df['Height']
        sub_df['BMI'] = df['BMI']
        sub_df['Goal'] = df['Fitness Goal'].astype(str).str.lower()
        sub_df['Target_Type'] = df['Fitness Type'].astype(str).str.lower()
        dfs.append(sub_df)

    # gym_members_exercise_tracking.csv
    track_path = os.path.join(DATA_DIR, 'gym_members_exercise_tracking.csv')
    if os.path.exists(track_path):
        df = pd.read_csv(track_path)
        sub_df = pd.DataFrame()
        sub_df['Age'] = df['Age']
        sub_df['Gender'] = df['Gender'].astype(str).str.lower()
        sub_df['Weight'] = df['Weight (kg)']
        sub_df['Height'] = df['Height (m)'] * 100 # convert to cm if needed, roughly... actually let's just keep raw or calculate BMI
        sub_df['BMI'] = df['BMI']
        sub_df['Goal'] = 'Unknown'
        sub_df['Target_Type'] = df['Workout_Type'].astype(str).str.lower()
        dfs.append(sub_df)

    if not dfs:
        print("Warning: No user profile datasets found. Skipping user model training.")
        return None

    unified_user_df = pd.concat(dfs, ignore_index=True)
    unified_user_df = unified_user_df.dropna(subset=['Target_Type'])
    
    # Fill NAs for features
    for col in ['Age', 'Weight', 'Height', 'BMI']:
        unified_user_df[col] = pd.to_numeric(unified_user_df[col], errors='coerce')
        unified_user_df[col] = unified_user_df[col].fillna(unified_user_df[col].median())
        
    for col in ['Gender', 'Goal']:
        unified_user_df[col] = unified_user_df[col].fillna('unknown')
        unified_user_df[col] = unified_user_df[col].astype(str).astype(object)

    return unified_user_df

def train_user_recommender(df):
    if df is None or len(df) == 0:
        return
        
    print("Training User Profile Classifier (Random Forest)...")
    
    X = df[['Age', 'Gender', 'Weight', 'BMI', 'Goal']]
    y = df['Target_Type']
    
    # Feature engineering for categorical vs numeric
    numeric_features = ['Age', 'Weight', 'BMI']
    categorical_features = ['Gender', 'Goal']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])
    
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=50, random_state=42))
    ])
    
    clf.fit(X, y)
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(MODEL_DIR, 'user_model.pkl'))
    print(f"Success! User Recommender trained on {len(df)} profiles.")

def train_all():
    # 1. Exercise Recommender Pipeline
    exercise_df = build_unified_exercise_dataset()
    train_exercise_recommender(exercise_df)
    
    # 2. User Profile Recommender Pipeline
    user_df = build_unified_user_dataset()
    train_user_recommender(user_df)

if __name__ == "__main__":
    train_all()