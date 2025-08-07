import React, { useState, useRef, useEffect,useCallback } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  IconButton,
  Badge,
  useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useTheme } from '@mui/material/styles';
import QrScanner from './QrScanner'; // adjust path as needed

const ItemLookup = () => {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [duplicateItem, setDuplicateItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBill, setShowBill] = useState(true); // for mobile toggle
const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const inputRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
const handleSearch = useCallback(async (scanned = null) => {
  const code = scanned || barcode.trim();
  if (!code) return;

  setLoading(true);
  try {
    const response = await axios.get(`https://onlineexpress.onrender.com/api/item/${code}`);

    const newItem = { ...response.data, qty: 1 };

    const exists = items.find(item => item.barcode === newItem.barcode);
    if (exists) {
      setDuplicateItem(newItem);
      setError('');
    } else {
      setItems(prev => [...prev, newItem]);
      setError('');
    }
  } catch (err) {
    setError('Item not found. Please check the barcode.');
  } finally {
    setLoading(false);
    setBarcode('');
    inputRef.current?.focus();
  }
}, [barcode, items]);
const handleClearAll = () => {
  setItems([]); // Clear all rows
  setClearConfirmOpen(false); // Close dialog
};
  const handleQtyConfirm = () => {
    setItems(prev =>
      prev.map(item =>
        item.barcode === duplicateItem.barcode
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
    setDuplicateItem(null);
  };
const handleIncreaseQty = (barcode) => {
  setItems(prev =>
    prev.map(item =>
      item.barcode === barcode ? { ...item, qty: item.qty + 1 } : item
    )
  );
};

const handleDecreaseQty = (barcode) => {
  setItems(prev =>
    prev.map(item =>
      item.barcode === barcode && item.qty > 1
        ? { ...item, qty: item.qty - 1 }
        : item
    )
  );
};
const handleScan = useCallback((result) => {
  const code = typeof result === 'string'
    ? result
    : typeof result?.text === 'string'
    ? result.text
    : '';

  if (code) handleSearch(code);
}, [handleSearch]);
  const handleQtyCancel = () => setDuplicateItem(null);

  const handleDelete = (barcode) => {
    setItems(prev => prev.filter(item => item.barcode !== barcode));
  };

  const totalQty = items.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = items.reduce((acc, item) => acc + item.qty * item.rate, 0);

  return (
    <>
      {/* AppBar */}
<AppBar
  position="static"
  sx={{
    background: 'linear-gradient(135deg, #fcf5f5ff, #fff5f5ff)', // Glossy red gradient
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
    borderBottom: '2px solid #030303ff', // Optional deep accent
  }}
>
  <Toolbar sx={{ px: 2 }}>
  <Typography
    variant="h6"
    sx={{
      flexGrow: 1,
      color: '#000000ff',
      fontWeight: 700,
      letterSpacing: '0.8px',
    }}
  >
    Billing
  </Typography>

   <IconButton
  onClick={() => setClearConfirmOpen(true)}
  sx={{ color: '#e53935', mr: 1 }}
  title="Clear All"
>
  <DeleteSweepRoundedIcon />
</IconButton>


  {isMobile && (
    <IconButton onClick={() => setShowBill(prev => !prev)} sx={{ color: '#a80909ff' }}>
      <Badge badgeContent={items.length} color="error">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  )}
</Toolbar>
</AppBar>



      {/* Main Grid */}
<Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
  <Box
    sx={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100%',
      width: '100%',
    }}
  >
    {/* Left Panel */}
    <Box
      sx={{
        flex: isMobile ? '1 1 100%' : '0 0 30%',
        padding: 2,
        display: isMobile ? (showBill ? 'none' : 'block') : 'block',
      }}
    >
      <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
<Typography
  variant="subtitle1" // smaller than h6
  align="center"
  sx={{
    backgroundColor: '#e53935',  // Red background
    color: '#ffffff',            // White text
    py: 0.5,                     // Less vertical padding
    px: 1.5,
    fontWeight: 400,
    borderRadius: 1,
    fontSize: '14px',            // Fine-tuned size
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '95%',
  }}
>
  QR / Barcode
</Typography>
    {/* QR Scanner - Shown First in Mobile */}
   <Box display={isMobile ? 'block' : 'none'}>
  
        <Typography variant="subtitle2" color="textSecondary" mb={1}>
          QR Scanner
        </Typography>
<QrScanner onScan={handleScan} />

      </Box>
  

    {/* Barcode input and Add button */}
    <TextField
      inputRef={inputRef}
      label="Barcode"
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      fullWidth
      variant="outlined"
      sx={{ my: 2 }}
    />

   <Button
  variant="contained"
  fullWidth
  onClick={handleSearch}
  disabled={loading}
  sx={{
    backgroundColor: '#4caf50', // MUI green
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#388e3c', // Darker green on hover
    },
    fontWeight: 'bold',
  }}
>
  {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Item'}
</Button>

    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

    {/* Total Qty & Amount Summary */}
<Box
  mt={4}
  p={2}
  borderRadius={2}
  sx={{
    backgroundColor: '#f5f7fa',
    border: '1px solid #d1d9e6',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
  }}
>
  <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
    Total Quantity
  </Typography>
  <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
    {totalQty}
  </Typography>

  <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
    Total Amount
  </Typography>
  <Typography variant="h4" sx={{ fontWeight: 600, color: '#047857' }}>
    ₹ {totalAmount.toFixed(2)}
  </Typography>
</Box>


      
    
      </Paper>
   </Box>


  {/* Right: Bill View */}
  {/* Right Panel */}
<Box
  sx={{
    flex: isMobile ? '1 1 100%' : '0 0 70%',
    padding: 1,
    display: isMobile ? (!showBill ? 'none' : 'block') : 'block',
  }}
>
  <Paper elevation={3} sx={{ p: 1.5, height: '100%' }}>
 <Typography
  variant="subtitle1"
  gutterBottom
  fontWeight="bold"
  align="center"
  sx={{
    fontSize: '16px',
    color: '#fff', // White font
    backgroundColor: '#2f302fff', // Corporate green
    borderRadius: '4px',
    padding: '8px',
    mb: 1,
  }}
>
  Order Summary
</Typography>


<Table size="small" sx={{ fontSize: '12px' }}>
  <TableHead sx={{ backgroundColor: '#d3d4d0ff' }}>
    <TableRow>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }}><strong>Barcode</strong></TableCell>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }}><strong>Particulars</strong></TableCell>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right"><strong>Rate</strong></TableCell>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right"><strong>Qty</strong></TableCell>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right"><strong>Amount</strong></TableCell>
      <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="center"><strong>Action</strong></TableCell>
    </TableRow>
  </TableHead>

  <TableBody>
    {items.length === 0 ? (
      <TableRow>
        <TableCell colSpan={6} align="center">
          <Typography variant="body2" color="textSecondary">
            No items added yet.
          </Typography>
        </TableCell>
      </TableRow>
    ) : (
      <>
        {items.map((item, i) => (
          <TableRow key={i}>
            <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{item.barcode}</TableCell>
            <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{item.particulars}</TableCell>
            <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right">{item.rate.toFixed(2)}</TableCell>
    <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right">
  <IconButton size="small" onClick={() => handleDecreaseQty(item.barcode)}>
    –
  </IconButton>
  {item.qty}
  <IconButton size="small" onClick={() => handleIncreaseQty(item.barcode)}>
    +
  </IconButton>
</TableCell>
            <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="right">{(item.qty * item.rate).toFixed(2)}</TableCell>
            <TableCell sx={{ fontSize: '12px', padding: '6px' }} align="center">
              <IconButton size="small" color="error" onClick={() => handleDelete(item.barcode)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}

        {/* Totals Row */}
        <TableRow sx={{ backgroundColor: '#f9f9f9', borderTop: '1px solid #ccc' }}>
          <TableCell colSpan={3} sx={{ padding: '4px' }} />
          <TableCell align="right" sx={{ padding: '4px', fontWeight: 600, fontSize: '13px', color: '#000' }}>
            {totalQty}
          </TableCell>
          <TableCell align="right" sx={{ padding: '4px', fontWeight: 600, fontSize: '13px', color: '#000' }}>
            ₹{totalAmount.toFixed(2)}
          </TableCell>
          <TableCell sx={{ padding: '4px' }} />
        </TableRow>
      </>
    )}
  </TableBody>
</Table>

  </Paper>
</Box>

  </Box>
</Box>


      {/* Duplicate Item Dialog */}
      <Dialog open={!!duplicateItem} onClose={handleQtyCancel}>
        <DialogTitle>Item Already Added</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This item is already in the bill. Do you want to increase the quantity by 1?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQtyCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleQtyConfirm} autoFocus>
            Yes, Add
          </Button>
        </DialogActions>
      </Dialog>
   <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)} maxWidth="xs" fullWidth>
  <DialogTitle sx={{ fontWeight: 700 }}>Clear All Items?</DialogTitle>
  <DialogContent>
    <DialogContentText sx={{ color: '#6b7280' }}>
      This will remove all items from the bill. Proceed?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setClearConfirmOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
    <Button onClick={handleClearAll} variant="contained" color="error" sx={{ textTransform: 'none' }}>
      Clear
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default ItemLookup;
