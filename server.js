const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const router = express.Router(); // เปลี่ยนจากการประกาศ router เป็น express.Router()
const Product = require('./model/product');
const connection = require("./config/db");
const ProductRouter = require('./model/product');


app.set('view engine', 'ejs'); // Set view engine to EJS
app.set('views', path.join(__dirname, 'views')); // Set views directory

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Serve CSS file separately
app.get('/css/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'public', 'css', filename), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});


// sign up 
app.get('/', (req, res) => {
    res.render('sign_up'); 
});


app.post('/signup', (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log('Received form data:', req.body);

    // Check if email, password, and confirmPassword are provided
    if (!email || !password || !confirmPassword) {
        return res.status(400).send('Email, password, and confirmPassword are required');
    }

    // Check if password matches confirmPassword
    if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm password do not match. Please try again.');
    }

    // Insert user into the database
    const sql = 'INSERT INTO users (email, password, confirmPassword) VALUES (?, ?, ?)';
    connection.query(sql, [email, password, confirmPassword], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error executing SQL query: ' + err.message);
        }
        console.log('User saved successfully:', result);
        res.render('login', { message: 'User signed up successfully. Please log in.' }); // Render login page with success message
    });
});

//login 
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Received login data:', req.body);

    if (!email || !password) {
        // ถ้าไม่มี email หรือ password ให้แสดงข้อความผิดพลาด
        return res.status(400).render('login', { error: 'Email and password are required' });
    }

    // ตรวจสอบ email และ password ในฐานข้อมูล
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).render('login', { error: 'Error executing SQL query: ' + err.message });
        }

        if (results.length === 0) {
            return res.status(401).render('login', { error: 'Incorrect email or password. Please try again.' });
        }

        // Check if the user is admin
        const user = results[0];
        if (user.email === 'admin' && user.password === 'admin') {
            res.render('admin/categoryManage'); // Render the admin dashboard using categoryManage.ejs
        } else {
            res.render('user/home'); // Render the user profile page using home.ejs
        }        
    });
});
app.get('/home', (req, res) => {
    // Render the consoles page
    res.render('user/home');
});

app.get('/consoles', (req, res) => {
    // Render the consoles page
    res.render('user/consoles');
});

app.get('/accessories', (req, res) => {
    // Render the consoles page
    res.render('user/accessories');
});

app.get('/contact', (req, res) => {
    // Render the consoles page
    res.render('user/contact');
});

app.get('/games', (req, res) => {
    // Render the consoles page
    res.render('user/games');
});

app.get('/productDetail', (req, res) => {
    // Render the consoles page
    res.render('user/productDetail');
});

app.get('/saleHistory', (req, res) => {
    res.render('admin/saleHistory');
});




// add category section
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
        }
        const categories = results.map(result => {
            return { id: result.id, category_name: result.category_name };
        });
        res.json(categories); // ส่งข้อมูลหมวดหมู่กลับไปในรูปแบบ JSON
    });
});

app.post('/api/addCategory', (req, res) => {
    const { category_name } = req.body;
  
    // เพิ่มหมวดหมู่ลงในฐานข้อมูล
    const sql = 'INSERT INTO categories (category_name) VALUES (?)';
    connection.query(sql, [category_name], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
      }
      console.log('Category added successfully:', result);
      res.sendStatus(200); // ส่งกลับสถานะ 200 OK เมื่อเพิ่มหมวดหมู่สำเร็จ
    });
});

app.delete('/api/deleteCategory/:id', (req, res) => {
    const categoryId = req.params.id;
    // ตรวจสอบความถูกต้องของ categoryId ก่อนใช้ในคิวรี
    if (!categoryId) {
        console.error('Invalid category ID:', categoryId);
        res.status(400).json({ error: 'Invalid category ID' });
        return;
    }
    connection.query('DELETE FROM categories WHERE id = ?', categoryId, (error, results) => {
        if (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Failed to delete category' });
            return;
        }
        console.log('Category deleted successfully');
        res.sendStatus(200);
    });
});

// อัพเดตหมวดหมู่
app.put('/api/updateCategory/:id', (req, res) => {
    const id = req.params.id;
    const newName = req.body.category_name;
  
    // ตรวจสอบว่ามี newName ที่ระบุมาหรือไม่
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'Category name cannot be empty' });
    }
  
    // อัพเดตหมวดหมู่ในฐานข้อมูล
    const sql = 'UPDATE categories SET category_name = ? WHERE id = ?';
    connection.query(sql, [newName, id], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Error updating category' });
      }
      console.log('Category updated successfully:', result);
      res.sendStatus(200);
    });
});

app.get('/productCategory', async (req, res) => {
    try {
        // Call findAllWithCategory function to get products with categories
        const products = await Product.findAllWithCategory();
        // Render productCategory.ejs with products data
        res.render('admin/productCategory', { products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/productCategory', async (req, res) => {
    try {
        const products = await Product.findAllWithCategory();
        res.render('admin/productCategory', { products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});

// เพิ่มสินค้าใหม่
app.post('/api/addProduct', (req, res) => {
    const { productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount } = req.body;

    // เพิ่มข้อมูลผลิตภัณฑ์ลงในฐานข้อมูล
    const sql = 'INSERT INTO products (product_name, product_description, product_images, product_price, product_price_promotion, product_sales_count) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
        }
        console.log('Product added successfully:', result);
        res.sendStatus(200); // ส่งกลับสถานะ 200 OK เมื่อเพิ่มผลิตภัณฑ์สำเร็จ
    });
});





module.exports = router;
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
