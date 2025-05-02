from flask import Flask, request, jsonify, send_file
import csv
import io
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

uploaded_data = []


from datetime import datetime

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.csv'):
        return jsonify({'message': 'Invalid file'}), 400

    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)

    for row in csv_input:
        # Look for 'order_date' or 'Order Date' and convert the date to correct format
        iso_date = row.get('order_date') or row.get('Order Date')

        if iso_date:
            try:
                # Ensure the date is parsed correctly even with 'Z' (UTC timezone)
                # Remove the 'Z' if it's there and parse it into a datetime object
                iso_date = iso_date.replace('Z', '')  # Remove 'Z'
                
                # Check if the date is already in ISO 8601 format and parse it
                dt = datetime.fromisoformat(iso_date)  # This will handle the date properly
                row['order_date'] = dt.strftime('%Y-%m-%d')  # Format it to 'YYYY-MM-DD'
            except ValueError:
                # Handle invalid date format if necessary
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
    # Placeholder: No actual email logic here
    return jsonify({'message': 'Email feature not implemented'}), 200

@app.route('/download', methods=['POST'])
def download():
    filters = request.json
    date_filter = filters.get('date')
    restaurant_filter = filters.get('restaurant')

    filtered_data = [
        row for row in uploaded_data
        if (not date_filter or row.get('order_date') == date_filter)
        and (not restaurant_filter or row.get('restaurant') == restaurant_filter)
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

    original_length = len(uploaded_data)
    uploaded_data = [
        row for row in uploaded_data
        if not (
    (not date_filter or row.get('order_date') == date_filter)
            and (not restaurant_filter or row.get('restaurant') == restaurant_filter)
        )
    ]
    deleted_count = original_length - len(uploaded_data)
    return jsonify({'message': f'{deleted_count} records deleted'}), 200

@app.route('/reset', methods=['POST'])
def reset_data():
    global uploaded_data
    uploaded_data.clear()
    return jsonify({'message': 'Data reset successful'}), 200

if __name__ == '__main__':
    app.run(debug=True)
