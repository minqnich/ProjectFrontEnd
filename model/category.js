const BaseSQLModel = require('./baseSQLModel');
//this is category.js
class Category extends BaseSQLModel {
  constructor() {
    super('categories'); // ตรงนี้ต้องเป็นชื่อตารางในฐานข้อมูล
  }

  // เพิ่มเมธอดสำหรับการเพิ่มหมวดหมู่ใหม่
  async addCategory(categoryData) {
    const query = 'INSERT INTO categories SET ?';
    const categoryId = await this.create(categoryData);
    return categoryId;
  }

  // เพิ่มเมธอดสำหรับการลบหมวดหมู่
  async deleteCategory(categoryId) {
    const rowsAffected = await this.delete(categoryId);
    return rowsAffected;
  }

  // เพิ่มเมธอดสำหรับการแก้ไขข้อมูลหมวดหมู่
  async editCategory(categoryId, categoryData) {
    const rowsAffected = await this.update(categoryId, categoryData);
    return rowsAffected;
}

  // เพิ่มเมธอดสำหรับการค้นหาหมวดหมู่โดยใช้ชื่อหมวดหมู่
  async findCategoryByName(categoryName) {
    const query = 'SELECT * FROM categories WHERE category_name = ?';
    const results = await this.executeQuery(query, [categoryName]);
    return results;
  }
}

module.exports = new Category();
