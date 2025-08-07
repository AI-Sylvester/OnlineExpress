const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/Item');
const app = express();

app.use(cors());
app.use(express.json());

// Route to get item by barcode
app.use('/api/item', itemRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
