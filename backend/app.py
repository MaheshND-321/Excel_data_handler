from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_mail import Mail, Message
import pandas as pd
import os
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
mail = Mail(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

DATA_CACHE = None
UPLOAD_FILEPATH = None


@app.route('/upload', methods=['POST'])
def upload_csv():
    global DATA_CACHE, UPLOAD_FILEPATH
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    filename = file.filename
    UPLOAD_FILEPATH = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(UPLOAD_FILEPATH)

    try:
        DATA_CACHE = pd.read_csv(UPLOAD_FILEPATH)
        return jsonify({"message": "File uploaded successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

@app.route('/save-data', methods=['POST'])
def save_data():
    global DATA_CACHE
    new_data = request.json.get('data')
    if not new_data:
        return jsonify({"error": "No data provided"}), 400

    try:
        DATA_CACHE = pd.DataFrame(new_data)  
        return jsonify({"message": "Data saved successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/data', methods=['GET'])
def get_data():
    global DATA_CACHE
    if DATA_CACHE is None:
        return jsonify({"data": []})
    return DATA_CACHE.to_json(orient="records")


@app.route('/download', methods=['GET'])
def download_csv():
    global DATA_CACHE
    if DATA_CACHE is None:
        return jsonify({"error": "No data to download"}), 400

    output_path = os.path.join(app.config['UPLOAD_FOLDER'], "processed_output.csv")
    DATA_CACHE.to_csv(output_path, index=False)
    return send_file(output_path, as_attachment=True)


@app.route('/send-email', methods=['POST'])
def send_email_summary():
    global DATA_CACHE
    if DATA_CACHE is None:
        return jsonify({"error": "No data to send"}), 400

    try:
        # Customize summary logic as per your CSV
        total_orders = len(DATA_CACHE)
        total_payable = round(DATA_CACHE["Total Payable to Merchant"].sum(), 2)
        commission_percent = round(DATA_CACHE["Commission %"].mean(), 2)

        summary_text = (
            f"Summary Report:\n\n"
            f"Total Orders: {total_orders}\n"
            f"Total Payable to Merchant: ₹{total_payable}\n"
            f"Average Commission %: {commission_percent}%"
        )

        msg = Message(
            subject="Merchant Summary Report",
            sender=app.config['MAIL_USERNAME'],
            recipients=["recipient@example.com"],  # Replace as needed
            body=summary_text
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/reset', methods=['POST'])
def reset_data():
    global DATA_CACHE, UPLOAD_FILEPATH
    DATA_CACHE = None
    UPLOAD_FILEPATH = None
    return jsonify({"message": "Data reset complete."}), 200


if __name__ == '__main__':
    app.run(debug=True)
