from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load saved model and scaler
model = joblib.load(r"C:\ML\Stock_market_pred\adp_linear_regression_model.pkl")
scaler = joblib.load(r"C:\ML\Stock_market_pred\adp_scaler.pkl")



@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        features = [
            float(data["open"]),
            float(data["high"]),
            float(data["low"]),
            float(data["close"]),
            float(data["volume"]),
            int(data["year"]),
            int(data["month"]),
            int(data["day"])
        ]

        features = np.array(features).reshape(1, -1)
        features_scaled = scaler.transform(features)

        prediction = model.predict(features_scaled)

        return jsonify({
            "prediction": round(float(prediction[0]), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
