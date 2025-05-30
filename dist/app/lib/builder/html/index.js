"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtpEmailHtml = void 0;
const generateOtpEmailHtml = (name, otp, email, expiryTime = "10 minutes") => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - LifeSaver</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 40px 20px;
            }
            
            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .tagline {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 20px;
                color: #333;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            
            .otp-container {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 5px 20px rgba(240, 147, 251, 0.3);
            }
            
            .otp-label {
                color: white;
                font-size: 16px;
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .otp-code {
                background-color: white;
                color: #333;
                font-size: 36px;
                font-weight: bold;
                padding: 20px 30px;
                border-radius: 10px;
                letter-spacing: 8px;
                margin: 0 auto;
                display: inline-block;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            }
            
            .instructions {
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 30px 0;
                border-radius: 5px;
            }
            
            .instructions h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 18px;
            }
            
            .instructions ul {
                color: #666;
                padding-left: 20px;
            }
            
            .instructions li {
                margin-bottom: 8px;
            }
            
            .security-note {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 25px 0;
                font-size: 14px;
            }
            
            .footer {
                background-color: #2d3748;
                color: #a0aec0;
                text-align: center;
                padding: 30px 20px;
            }
            
            .footer h4 {
                color: white;
                margin-bottom: 15px;
            }
            
            .contact-info {
                margin-bottom: 20px;
            }
            
            .social-links {
                margin-top: 20px;
            }
            
            .social-links a {
                color: #667eea;
                text-decoration: none;
                margin: 0 10px;
                font-weight: 500;
            }
            
            .copyright {
                margin-top: 20px;
                font-size: 12px;
                opacity: 0.7;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                    padding: 15px 20px;
                }
                
                .header {
                    padding: 30px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">🍽️ LifeSaver</div>
                <div class="tagline">Your Smart Mess Management Solution</div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Hello ${name}! 👋</div>
                
                <div class="message">
                    Welcome to LifeSaver! We're excited to have you join our community of smart mess management. 
                    To complete your registration and secure your account, please verify your email address using the OTP below.
                </div>
                
                <!-- OTP Section -->
                <div class="otp-container">
                    <div class="otp-label">Your One-Time Password (OTP)</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <!-- Instructions -->
                <div class="instructions">
                    <h3>📋 How to use this OTP:</h3>
                    <ul>
                        <li>Return to the LifeSaver app or website</li>
                        <li>Enter this 6-digit code in the verification field</li>
                        <li>Complete your account setup</li>
                        <li>Start managing your mess efficiently!</li>
                    </ul>
                </div>
                
                <!-- Security Note -->
                <div class="security-note">
                    <strong>🔒 Security Notice:</strong> This OTP is valid for ${expiryTime} only. Never share this code with anyone. 
                    If you didn't request this verification, please ignore this email or contact our support team.
                </div>
                
                <div class="message">
                    Once verified, you'll be able to:
                    <br>• Track your meal plans and nutrition
                    <br>• Manage mess payments and dues
                    <br>• View daily menus and announcements  
                    <br>• Connect with your mess community
                    <br>• Access exclusive features and discounts
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <h4>LifeSaver Support</h4>
                <div class="contact-info">
                    <div>📧 support@lifesaver.com</div>
                    <div>📱 +1 (555) 123-4567</div>
                    <div>🌐 www.lifesaver.com</div>
                </div>
                
                <div class="social-links">
                    <a href="#">Facebook</a> |
                    <a href="#">Twitter</a> |
                    <a href="#">Instagram</a> |
                    <a href="#">LinkedIn</a>
                </div>
                
                <div class="copyright">
                    © 2025 LifeSaver. All rights reserved.<br>
                    This email was sent to ${email}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
exports.generateOtpEmailHtml = generateOtpEmailHtml;
