<?php
/**
 * PEST CO INDIA - Form Processing & Email / CSV Handler
 * Recipient: pestcoindia92@gmail.com
 */

header('Content-Type: application/json; charset=utf-8');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please submit via POST.'
    ]);
    exit;
}

// Sanitize and extract input fields
$name         = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone        = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email        = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$service      = isset($_POST['service']) ? trim(strip_tags($_POST['service'])) : '';
$service_area = isset($_POST['service_area']) ? trim(strip_tags($_POST['service_area'])) : '';
$pincode      = isset($_POST['pincode']) ? trim(strip_tags($_POST['pincode'])) : '';
$premise_type = isset($_POST['premise_type']) ? trim(strip_tags($_POST['premise_type'])) : 'Residential';
$premise_size = isset($_POST['premise_size']) ? trim(strip_tags($_POST['premise_size'])) : 'N/A';
$square_feet  = isset($_POST['square_feet']) ? floatval($_POST['square_feet']) : 0;
$message      = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
$ip_address   = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$timestamp    = date('Y-m-d H:i:s');

// 1. Required field validations
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Full Name is required.']);
    exit;
}

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Mobile Number is required.']);
    exit;
}

if (empty($service) || $service === 'Select Service') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please select the pest control service required.']);
    exit;
}

if (empty($service_area)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Service Area / City is required.']);
    exit;
}

if (empty($pincode)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Pincode is required.']);
    exit;
}

// 2. Minimum 200 sq. ft. validation
if ($square_feet < 200) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Square Feet must be at least 200 sq. ft.']);
    exit;
}

// 3. Save to CSV log file
$csvFile = __DIR__ . '/inquiries.csv';
$csvExists = file_exists($csvFile);

$fp = @fopen($csvFile, 'a');
if ($fp) {
    // Write header if new file
    if (!$csvExists || filesize($csvFile) === 0) {
        fputcsv($fp, [
            'Date & Time',
            'Full Name',
            'Mobile Number',
            'Email Address',
            'Service Required',
            'Service Area',
            'Pincode',
            'Premise Type',
            'Premise Size',
            'Square Feet',
            'Notes / Message',
            'IP Address'
        ]);
    }
    
    // Write inquiry record
    fputcsv($fp, [
        $timestamp,
        $name,
        $phone,
        $email ?: 'Not Provided',
        $service,
        $service_area,
        $pincode,
        $premise_type,
        $premise_size,
        $square_feet,
        $message ?: 'None',
        $ip_address
    ]);
    fclose($fp);
}

// 4. Send Notification Email to pestcoindia92@gmail.com
$to = 'pestcoindia92@gmail.com';
$subject = "New Pest Control Enquiry - {$service} ({$service_area})";

$emailBody = "====================================\n";
$emailBody .= "PEST CO INDIA - NEW SERVICE ENQUIRY\n";
$emailBody .= "====================================\n\n";
$emailBody .= "Date & Time:      {$timestamp}\n";
$emailBody .= "Customer Name:    {$name}\n";
$emailBody .= "Mobile Number:    {$phone}\n";
$emailBody .= "Email:            " . ($email ?: 'Not provided') . "\n";
$emailBody .= "Service Required: {$service}\n";
$emailBody .= "Service Area:     {$service_area}\n";
$emailBody .= "Pincode:          {$pincode}\n";
$emailBody .= "Premise Type:     {$premise_type}\n";
$emailBody .= "Premise Size:     {$premise_size}\n";
$emailBody .= "Square Feet:      {$square_feet} sq.ft\n";
$emailBody .= "Notes / Message:  " . ($message ?: 'No additional notes') . "\n\n";
$emailBody .= "------------------------------------\n";
$emailBody .= "Sender IP:        {$ip_address}\n";

$headers = "From: web-inquiry@pestcoindia.com\r\n";
if (!empty($email)) {
    $headers .= "Reply-To: {$email}\r\n";
}
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt sending email via PHP mail()
@mail($to, $subject, $emailBody, $headers);

// 5. Return success JSON
echo json_encode([
    'status' => 'success',
    'message' => "Thank you, {$name}! Your enquiry for {$service} in {$service_area} has been successfully submitted. Our pest specialist will call you shortly on {$phone}."
]);
?>
