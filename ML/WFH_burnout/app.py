from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load the trained model and scaler
MODEL_PATH = r'C:\ML\WFH_burnout\burnout_linear_regression_model.pkl'
SCALER_PATH = r'C:\ML\WFH_burnout\burnout_scaler.pkl'

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✓ Model and scaler loaded successfully")
except Exception as e:
    print(f"✗ Error loading model or scaler: {e}")
    model = None
    scaler = None


@app.route('/')
def home():
    """Render the main HTML page"""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """
    Handle prediction requests from the frontend
    Expects JSON with all 8 feature values
    """
    try:
        # Check if model is loaded
        if model is None or scaler is None:
            return jsonify({
                'error': 'Model or scaler not loaded. Please check file paths.'
            }), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        # Extract features in the EXACT order the model expects
        features = [
            float(data.get('work_hours', 0)),
            float(data.get('screen_time_hours', 0)),
            int(data.get('meetings_count', 0)),
            int(data.get('breaks_taken', 0)),
            int(data.get('after_hours_work', 0)),
            float(data.get('sleep_hours', 0)),
            float(data.get('task_completion_rate', 0)),
            int(data.get('day_type_Weekend', 0))  # 0 or 1
        ]
        
        # Convert to numpy array and reshape for single prediction
        features_array = np.array(features).reshape(1, -1)
        
        # Apply the scaler (same scaler used during training)
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)
        burnout_score = float(prediction[0])
        
        # Determine burnout level based on score
        if burnout_score < 30:
            level = "Low"
            message = "You're managing stress well. Keep it up!"
        elif burnout_score < 60:
            level = "Moderate"
            message = "Consider taking breaks and managing workload."
        else:
            level = "High"
            message = "High burnout risk detected. Please prioritize self-care."
        
        # Return prediction as JSON
        return jsonify({
            'burnout_score': round(burnout_score, 2),
            'burnout_level': level,
            'message': message
        })
    
    except ValueError as ve:
        return jsonify({
            'error': f'Invalid input data: {str(ve)}'
        }), 400
    
    except Exception as e:
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)