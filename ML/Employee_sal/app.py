from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load the trained model and scaler
MODEL_PATH = r'C:\ML\Employee_sal\adp_linear_regression_model.pkl'
SCALER_PATH = r'C:\ML\Employee_sal\adp_scaler.pkl'

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
    Expects JSON with age and experience values
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
            float(data.get('age', 0)),
            float(data.get('experience', 0))
        ]
        
        # Validate inputs
        age = features[0]
        experience = features[1]
        
        if age < 18 or age > 100:
            return jsonify({
                'error': 'Age must be between 18 and 100'
            }), 400
        
        if experience < 0 or experience > (age - 18):
            return jsonify({
                'error': 'Experience cannot be negative or greater than (age - 18)'
            }), 400
        
        # Convert to numpy array and reshape for single prediction
        features_array = np.array(features).reshape(1, -1)
        
        # Apply the scaler (same scaler used during training)
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)
        predicted_salary = float(prediction[0])
        
        # Determine salary level based on prediction
        if predicted_salary < 50000:
            level = "Entry Level"
            message = "Starting salary range. Great beginning to your career!"
        elif predicted_salary < 80000:
            level = "Mid Level"
            message = "Competitive mid-career salary. You're growing professionally!"
        elif predicted_salary < 120000:
            level = "Senior Level"
            message = "Strong senior-level compensation. Excellent career progress!"
        else:
            level = "Executive Level"
            message = "Top-tier executive compensation. Outstanding achievement!"
        
        # Return prediction as JSON
        return jsonify({
            'predicted_salary': round(predicted_salary, 2),
            'salary_level': level,
            'message': message,
            'age': age,
            'experience': experience
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