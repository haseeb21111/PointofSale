import React, { useEffect, useState, useCallback } from 'react';
import { Table, message, Input, Dropdown, Menu } from 'antd';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import Layout from '../../components/Layout';
import './Customers.css';

const Customers = () => {
  const dispatch = useDispatch();
  const [groupedData, setGroupedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // State for filtered data
  const [productData, setProductData] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getAllBills = useCallback(async () => {
    try {
        dispatch({ type: 'SHOW_LOADING' });
        const { data } = await axios.get('/api/bills/getbills?grouped=true'); // Request grouped data
        setGroupedData(data || []); // Set grouped data
        setFilteredData(data || []); // Initialize filtered data
        dispatch({ type: 'HIDE_LOADING' });
    } catch (error) {
        dispatch({ type: 'HIDE_LOADING' });
        console.error('Error fetching bills:', error);
    }
}, [dispatch]);


  useEffect(() => {
    getAllBills();
  }, [getAllBills]);

  useEffect(() => {
    // Filtering logic based on search query
    const filtered = groupedData.filter(
      (group) =>
        group.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.customerCNIC.toString().includes(searchQuery) ||
        group.customerPhone.toString().includes(searchQuery) ||
        group.customerAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, groupedData]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key) => {
    const sortedData = [...groupedData].sort((a, b) =>
      key === 'new'
        ? new Date(b.bills[0].createdAt) - new Date(a.bills[0].createdAt)
        : new Date(a.bills[0].createdAt) - new Date(b.bills[0].createdAt)
    );
    setFilteredData(sortedData);
  };

  const fetchProductsByBillId = async (billId) => {
    try {
      const response = await axios.get(`/api/bills/products-by-customer/${billId}`);
      setProductData((prevData) => ({ ...prevData, [billId]: response.data }));
    } catch (error) {
      message.error('Error fetching products for the bill');
      console.error('Error:', error);
    }
  };

  const handleExpand = (expanded, record) => {
    if (expanded) {
      record.bills.forEach((bill) => fetchProductsByBillId(bill._id));
      setExpandedRowKeys([`${record.customerName}_${record.customerCNIC}`]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const calculateBillSummary = (bill) => ({
    subTotal: bill.subTotal || 0,
    tax: bill.tax || 0,
    discount: bill.discount || 0,
    totalBill: bill.totalAmount || 0,
  });

  const filterMenu = (
    <Menu onClick={(e) => handleFilterChange(e.key)}>
      <Menu.Item key="new">New</Menu.Item>
      <Menu.Item key="old">Old</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
    },
    {
      title: 'Customer CNIC',
      dataIndex: 'customerCNIC',
    },
    {
      title: 'Contact Number',
      dataIndex: 'customerPhone',
    },
    {
      title: 'Customer Address',
      dataIndex: 'customerAddress',
    },
  ];

  return (
    <Layout>
      <div className="header-container">
        <h2>All Customers</h2>
        <div className="search-filter-containerc">
          <Input
            placeholder="Search by Customer Name, CNIC, or Address"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            value={searchQuery}
            onChange={handleSearch}
            className="search-bar"
          />
          <Dropdown overlay={filterMenu} trigger={['hover']}>
            <FilterOutlined
              className="filter-icon"
              style={{ fontSize: '20px', cursor: 'pointer', marginLeft: '10px', marginTop: '10px' }}
            />
          </Dropdown>
        </div>
      </div>

      <Table
  dataSource={filteredData}
  columns={columns}
  bordered
  rowKey={(record) => `${record.customerName}_${record.customerCNIC}`}
  expandable={{
    expandedRowRender: (record) => (
      <div>
        {record.bills.map((bill) => {
          const { subTotal, tax, discount, totalBill } = calculateBillSummary(bill);
          const products = productData[bill._id] || [];
          return (
            <div key={bill._id} className="billm-card">
              {/* Bill Header */}
              <div className="billm-header">
                <h4>Bill ID: {bill._id}</h4>
                <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleString()}</p>
              </div>

              {/* Content Container */}
              <div className="billm-content">
                {/* Products Section */}
                <div className="billm-products-container">
                  {products.map((product) => (
                    <div key={product._id} className="product-cardz">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-imagez"
                      />
                      <div className="product-detailsz">
                        <p><strong>Product Name:</strong> {product.name}</p>
                        <p><strong>Price:</strong> Rs. {product.price}</p>
                        <p><strong>Quantity:</strong> {product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary Section */}
                <div className="billm-summary-container">
                  <h4>Bill Summary</h4>
                  <p><strong>Sub Total:</strong> Rs. {subTotal.toFixed(2)}</p>
                  <p><strong>Tax:</strong> Rs. {tax.toFixed(2)}</p>
                  <p><strong>Discount:</strong> Rs. {discount.toFixed(2)}</p>
                  <p><strong>Total Bill:</strong> Rs. {totalBill.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ),
    onExpand: handleExpand,
    expandedRowKeys,
  }}
/>



    </Layout>
  );
};

export default Customers;
