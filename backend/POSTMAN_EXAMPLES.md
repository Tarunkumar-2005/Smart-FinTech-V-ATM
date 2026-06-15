# Postman API Examples - Smart ATM Backend

Base URL: `http://localhost:5000/api`

---

## 1. Auth APIs

### Register
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "pin": "1234"
}
```

### Login
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "pin": "1234"
}
```

**Response:** Returns `token` - use this in Authorization header for protected routes.

---

## 2. Account APIs (Require JWT)

Add header: `Authorization: Bearer <your-token>`

### Get Balance
```
GET {{baseUrl}}/account/balance
Authorization: Bearer <token>
```

### Deposit
```
POST {{baseUrl}}/account/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}
```

### Withdraw
```
POST {{baseUrl}}/account/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500
}
```

### Mini Statement (Last 5 transactions)
```
GET {{baseUrl}}/account/transactions
Authorization: Bearer <token>
```

Optional: `?limit=10` for more transactions

---

## 3. Admin APIs (Require Admin JWT)

Login with admin account first. Add header: `Authorization: Bearer <admin-token>`

### Get All Users
```
GET {{baseUrl}}/admin/users
Authorization: Bearer <admin-token>
```

### Get All Transactions
```
GET {{baseUrl}}/admin/transactions
Authorization: Bearer <admin-token>
```

---

## 4. Health Check

```
GET {{baseUrl}}/health
```

---

## Postman Environment Variables

Create an environment with:
- `baseUrl`: http://localhost:5000/api
- `token`: (set from login response - use Tests script: `pm.environment.set("token", pm.response.json().data.token)`)
