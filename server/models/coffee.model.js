const db = require('../config/db.config');

class Coffee {
  constructor(coffee) {
    this.name = coffee.name;
    this.description = coffee.description;
    this.price = coffee.price;
    this.category = coffee.category;
    this.image = coffee.image;
  }

  static async create(newCoffee) {
    try {
      const [result] = await db.execute(
        'INSERT INTO coffees (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)',
        [newCoffee.name, newCoffee.description, newCoffee.price, newCoffee.category, newCoffee.image]
      );
      return { id: result.insertId, ...newCoffee };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM coffees');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM coffees WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, coffee) {
    try {
      const [result] = await db.execute(
        'UPDATE coffees SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?',
        [coffee.name, coffee.description, coffee.price, coffee.category, coffee.image, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM coffees WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Coffee; 