import os
from flask import Flask, request, jsonify, send_file
import csv
import io
from datetime import datetime
from flask_cors import CORS
from flask_mail import Mail, Message
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')

CORS(app, origins=["*"])

load_dotenv()

uploaded_data = []

app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS") == 'True'
app.config['MAIL_USE_SSL'] = os.getenv("MAIL_USE_SSL") == 'True'

# Initialize Flask-Mail
mail = Mail(app)

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.csv'):
        return jsonify({'message': 'Invalid file'}), 400

    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)

    for row in csv_input:
        iso_date = row.get('order_date') or row.get('Order Date')

        if iso_date:
            try:

                iso_date = iso_date.replace('Z', '') 
                
                dt = datetime.fromisoformat(iso_date) 
                row['order_date'] = dt.strftime('%Y-%m-%d')
            except ValueError:
                pass

        uploaded_data.append(row)

    return jsonify({'message': 'File uploaded successfully'}), 200


@app.route('/data', methods=['GET'])
def display_data():
    return jsonify(uploaded_data), 200

@app.route('/save-data', methods=['POST'])
def save_data():
    global uploaded_data
    uploaded_data = request.json.get('data', [])
    return jsonify({'message': 'Data saved'}), 200


@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    print(data)  # Log the incoming request data

    recipient_email = data.get("to")
    if not recipient_email:
        return jsonify({"message": "No recipient provided"}), 400

    uploaded_data = data.get("uploaded_data")
    if not uploaded_data:
        return jsonify({"message": "No data found to process"}), 400

    datewise_summary = generate_datewise_summary(uploaded_data)

    sender_email = os.getenv("MAIL_USERNAME")
    msg = Message(
        "Datewise Summary Report",
        sender=sender_email,
        recipients=[recipient_email],
    )
    msg.body = f"Here is your datewise summary!\n\n{datewise_summary}"

    try:
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error sending email: {str(e)}"}), 500


def generate_datewise_summary(uploaded_data):
    """
    Generate a date-wise summary based on the uploaded data.
    This will group the data by order date and summarize key fields.
    """
    summary = {}
    for record in uploaded_data:
        order_date = record.get("order_date")
        if not order_date:
            continue  
        
        order_date = datetime.strptime(order_date, "%Y-%m-%d")
        date_str = order_date.strftime("%Y-%m-%d")  
        
        if date_str not in summary:
            summary[date_str] = {
                "total_order_value": 0,
                "total_platform_fee": 0,
                "total_gst": 0,
                "total_payable_to_merchant": 0,
                "total_orders": 0,
            }

        summary[date_str]["total_order_value"] += float(record.get("Order Total", 0))
        summary[date_str]["total_platform_fee"] += float(record.get("GF Platform Fee", 0))
        summary[date_str]["total_gst"] += float(record.get("Total GST", 0))
        summary[date_str]["total_payable_to_merchant"] += float(record.get("Total Payable to Merchant", 0))
        summary[date_str]["total_orders"] += 1

    summary_text = ""
    for date_str, values in summary.items():
        summary_text += f"Date: {date_str}\n"
        summary_text += f"Total Orders: {values['total_orders']}\n"
        summary_text += f"Total Order Value: ${values['total_order_value']:.2f}\n"
        summary_text += f"Total Platform Fee: ${values['total_platform_fee']:.2f}\n"
        summary_text += f"Total GST: ${values['total_gst']:.2f}\n"
        summary_text += f"Total Payable to Merchant: ${values['total_payable_to_merchant']:.2f}\n"
        summary_text += "-" * 40 + "\n"
    
    return summary_text
    

@app.route('/download', methods=['POST'])
def download():
    filters = request.json
    date_filter = filters.get('date')
    restaurant_filter = filters.get('restaurant')

    filtered_data = [
        row for row in uploaded_data
        if (not date_filter or row.get('order_date') == date_filter)
        and (not restaurant_filter or (row.get('restaurant') or row.get('Restaurant Name')) == restaurant_filter)
    ]

    if not filtered_data:
        return jsonify({'message': 'No data found for the given filters'}), 404

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=filtered_data[0].keys())
    writer.writeheader()
    writer.writerows(filtered_data)
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='filtered_data.csv'
    )


@app.route('/delete', methods=['POST'])
def delete_data():
    global uploaded_data
    filters = request.json
    date_filter = filters.get('date')
    restaurant_filter = filters.get('restaurant')

    def match(row):
        date_match = not date_filter or row.get('order_date') == date_filter
        restaurant_name = row.get('restaurant') or row.get('Restaurant Name')
        restaurant_match = not restaurant_filter or restaurant_name == restaurant_filter
        return date_match and restaurant_match

    original_length = len(uploaded_data)
    uploaded_data = [row for row in uploaded_data if not match(row)]
    deleted_count = original_length - len(uploaded_data)
    return jsonify({'message': f'{deleted_count} records deleted'}), 200


@app.route('/reset', methods=['POST'])
def reset_data():
    global uploaded_data
    uploaded_data.clear()
    return jsonify({'message': 'Data reset successful'}), 200

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_ENV") == "development")

