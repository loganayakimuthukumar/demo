Register User: POST /api/register
Login User: POST /api/login
Create One-Time Link: POST /api/create-link with body { "username": "user@example.com" }
Verify One-Time Link: GET /api/verify-link/:token
Get Current Time: GET /api/current-time with Authorization: Bearer <token>
