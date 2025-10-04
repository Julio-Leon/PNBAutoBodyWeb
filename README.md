# PNBAutoBodyWeb

## Features

- Online appointment booking system
- User authentication and account management
- Vehicle management for customers
- Email notifications for appointment confirmations
- SMS notifications for appointment confirmations
- Admin dashboard for appointment management

## SMS Notifications

The website now includes SMS notifications for when logged-in customers create appointments. This feature:

- Automatically sends a confirmation text message when a logged-in user creates an appointment
- Uses Twilio as the SMS service provider
- Formats phone numbers to international format
- Falls back gracefully if SMS sending fails

For setup details, see [SMS_NOTIFICATIONS_README.md](./SMS_NOTIFICATIONS_README.md).
