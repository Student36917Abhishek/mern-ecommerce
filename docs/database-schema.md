# Database Schema

## Users Collection

Fields:

- \_id
- name
- email
- password
- role (user/admin)
- createdAt

Example:
{
"name": "Rahul",
"email": "rahul@gmail.com",
"password": "hashedpassword",
"role": "user",
"createdAt": "2026-04-08"
}

## Products Collection

Fields:

- \_id
- name
- description
- price
- category
- stock
- image
- createdAt

Example:
{
"name": "Running Shoes",
"description": "Comfortable sports shoes",
"price": 2999,
"category": "Footwear",
"stock": 50,
"image": "shoe.jpg"
}

## Cart Collection

Fields:

- \_id
- userId
- products
  - productId
  - quantity

## Orders Collection

Fields:

- \_id
- userId
- products
  - productId
  - quantity
- totalAmount
- status
- shippingAddress
- createdAt

Status values:

- pending
- shipped
- delivered
- cancelled
