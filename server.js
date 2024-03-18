const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const router = express.Router(); // เปลี่ยนจากการประกาศ router เป็น express.Router()
const Product = require('./model/product');
const connection = require("./config/db");
const ProductRouter = require('./model/product');
const Category = require('./model/category');


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


app.get('/categoryManage', async (req, res) => {
    try {
        const categories = await Category.findAll();
        console.log(categories); // Add this line to check the contents of the categories variable

        const products = await Product.findAllWithCategory();
        res.render('admin/categoryManage', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
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
            res.redirect('/categoryManage');
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

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Delete the product from the database
        const deletedProductCount = await Product.delete(productId);
        
        if (deletedProductCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Send a success response
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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


// app.get('/productCategory', async (req, res) => {
    // try {
       //  const products = await Product.findAllWithCategory();
       // res.render('admin/productCategory', { products });
    // } catch (error) {
       // console.error('Error rendering product category:', error);
       // res.status(500).send('Internal Server Error');
   //  }
// });

app.get('/productCategory', async (req, res) => {
    try {
        const categories = await Category.findAll(); // ดึงข้อมูล category จากฐานข้อมูล
        const products = await Product.findAllWithCategory(); // ดึงข้อมูลสินค้าพร้อมกับ category จากฐานข้อมูล
        console.log(categories); // เพิ่มบรรทัดนี้เพื่อตรวจสอบว่า categories มีค่าหรือไม่
        console.log(products); // เพิ่มบรรทัดนี้เพื่อตรวจสอบว่า products มีค่าหรือไม่
        res.render('admin/productCategory', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categoryManage', async (req, res) => {
    try {
        const categories = await Category.findAll(); // ดึงข้อมูล category จากฐานข้อมูล
        const products = await Product.findAllWithCategory(); // ดึงข้อมูลสินค้าพร้อมกับ category จากฐานข้อมูล
        console.log(categories); // เพิ่มบรรทัดนี้เพื่อตรวจสอบว่า categories มีค่าหรือไม่
        console.log(products); // เพิ่มบรรทัดนี้เพื่อตรวจสอบว่า products มีค่าหรือไม่
        res.render('admin/categoryManage', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});


// เพิ่มสินค้าใหม่
app.post('/api/addProduct', (req, res) => {
    const { productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory } = req.body; // เพิ่ม productCategory ในการรับค่าจาก req.body

    // เพิ่มข้อมูลผลิตภัณฑ์ลงในฐานข้อมูล
    const sql = 'INSERT INTO products (product_name, product_description, product_images, product_price, product_price_promotion, product_sales_count, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)'; // เปลี่ยนชื่อคอลัมน์ product_category เป็น category_id
    connection.query(sql, [productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
        }
        console.log('Product added successfully:', result);
        res.sendStatus(200); // ส่งกลับสถานะ 200 OK เมื่อเพิ่มผลิตภัณฑ์สำเร็จ
    });
});

app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        // ดึงข้อมูลสินค้าจากฐานข้อมูลโดยใช้ ID ที่ระบุ
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        // ส่งข้อมูลสินค้ากลับเป็น JSON
        res.json(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update product data
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount , productCategory} = req.body;

    try {
        // Update the product data in the database
        const sql = 'UPDATE products SET product_name = ?, product_description = ?, product_images = ?, product_price = ?, product_price_promotion = ?, product_sales_count = ?, category_id = ?  WHERE id = ?';
        connection.query(sql, [productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory, productId], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ error: 'Error updating product' });
            }
            console.log('Product updated successfully:', result);
            res.sendStatus(200);
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
