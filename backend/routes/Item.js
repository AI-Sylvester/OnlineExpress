const express = require('express');
const pool = require('../db'); // Adjust path as needed
const router = express.Router();

// GET /api/item/:barcode
router.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;

  try {
    const result = await pool.query(
      `SELECT barcode, particulars, salesTax1Per, saleRate 
       FROM stockmas 
       WHERE barcode = $1`,
      [barcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    const row = result.rows[0];

    return res.json({
      barcode: row.barcode,
      particulars: row.particulars,
      category1: row.itemcategorycode1,
      category2: row.itemcategorycode2,
      tax_percent: parseFloat(row.salestax1per),
      rate: parseFloat(row.salerate),
    });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ detail: 'Database error' });
  }
});

module.exports = router;
