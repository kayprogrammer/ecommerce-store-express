# ECOMMERCE STORE EXPRESS

![alt text](https://github.com/kayprogrammer/ecommerce-store-express/blob/main/assets/logo.png?raw=true)


#### EXPRESS DOCS: [Documentation](https://expressjs.com/)
#### TYPESCRIPT DOCS: [Documentation](https://www.typescriptlang.org/docs/)
#### MONGOOSE DOCS: [Documentation](https://mongoosejs.com/docs/) 

## Key Features
***Authentication and Authorization***: Secure your application with robust JWT-based authentication and authorization, ensuring that only authorized users can access protected resources. Features like Google auth and Facebook auth were included.

***Password Reset***: Provides a straightforward password reset process, allowing users to regain access to their accounts quickly and securely.

***Account Verification***: Ensures user authenticity through email verification, enhancing the security of user accounts and preventing fraudulent activities.

***Profiles Management***: Allows users to view, and update their profiles. Other features include shipping addresses view, create, update and delete.

***Shop Management***: Allows users and guests to navigate through products, add to wishlist, add to cart, create and confirm order, view orders etc.

***Seller Management***: Allows vendors/sellers to register as a seller, manage their products, variants and orders.


## How to run locally
* Download this repo or run: 
```bash
    $ git clone git@github.com:kayprogrammer/ecommerce-store-express.git
```

#### In the root directory:
- Install all dependencies
```bash
    $ npm install
```
- Create an `.env` file and copy the contents from the `.env.example` to the file and set the respective values.

- Generate initial data
```bash
    $ npm run seed
```
OR
```bash
    $ make init
```
- Run Locally
```bash
    $ npm run dev
```
OR
```bash
    $ make run
```

- Run With Docker
```bash
    $ docker-compose up --build -d --remove-orphans
```
OR
```bash
    $ make build
```

- Test Coverage
```bash
    $ npm run test
```
OR
```bash
    $ make test
```

## Docs
#### API Url: [E-Store Swagger Docs](https://estore-express.fly.dev/) 

![alt text](https://github.com/kayprogrammer/ecommerce-store-express/blob/main/assets/1.png?raw=true)

![alt text](https://github.com/kayprogrammer/ecommerce-store-express/blob/main/assets/2.png?raw=true)

![alt text](https://github.com/kayprogrammer/ecommerce-store-express/blob/main/assets/3.png?raw=true)
