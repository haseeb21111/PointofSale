import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import LayoutApp from '../../components/Layout';
import { DeleteOutlined, EditOutlined  } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Table, message, Row, Col, Dropdown, Menu } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import FormItem from 'antd/lib/form/FormItem';
import { useCategories } from '../../context/CategoryContext';
import { useLocation } from 'react-router-dom';


import './Product.css';

const Products = () => {
  const dispatch = useDispatch();
  const [productData, setProductData] = useState([]);
  const [popModal, setPopModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm] = Form.useForm();
  const [sellerForm] = Form.useForm();
  
  const [searchQuery, setSearchQuery] = useState(''); // Search query for dropdown filter
  const [isExistingUserSelected, setIsExistingUserSelected] = useState(false); // Track if an Existing User is selected
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("new");
  const [sellers, setSellers] = useState([]); // Store all sellers from the database

  
const { categories } = useCategories(); // Fetch categories from context

const location = useLocation();
    const { product, seller } = location.state || {}; // Fallback if no state is passed

    console.log(product, seller); // Debug ke liye
  

  // Fetch all sellers from the backend
const fetchSellers = useCallback(async () => {
  try {
    dispatch({ type: "SHOW_LOADING" });
    const { data } = await axios.get('/api/sellers/getsellers'); // Adjust API endpoint if necessary
    setSellers(data); // Store fetched sellers
    dispatch({ type: "HIDE_LOADING" });
  } catch (error) {
    dispatch({ type: "HIDE_LOADING" });
    console.error("Error fetching sellers:", error);
    message.error("Failed to fetch sellers");
  }
}, [dispatch]);

useEffect(() => {
  fetchSellers(); // Fetch sellers on component mount
}, [fetchSellers]);

  const getAllProducts = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get('/api/products/getproducts');
      
      const processedData = data.map((product) => ({
        ...product,
        seller: product.sellerId  // Access seller details from populated data
      }));
      
      setProductData(processedData);
      setFilteredProducts(processedData); // Set filteredProducts initially
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.error("Error fetching products and sellers:", error);
    }
  }, [dispatch]);
  

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);
  
  
  

  const handlerDelete = async (record) => {
    try {
        dispatch({ type: "SHOW_LOADING" });

        // Calculate the investment amount to deduct
        const amountToDeduct = record.buyingPrice * record.quantity;

        // Delete the product
        await axios.post('/api/products/deleteproducts', { productId: record._id });
        message.success("Product Deleted Successfully!");

        // Deduct the amount from the investment
        await axios.post('/api/investment/deduct', { amount: amountToDeduct });

        // Refresh products list
        getAllProducts();
        setPopModal(false);
        dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        message.error("Error!");
        console.log(error);
    }
};


const handlerSubmit = async () => {
  try {
      const productValues = await productForm.validateFields();
      dispatch({ type: "SHOW_LOADING" });

      // Calculate Due Amount
      const dueAmount = productValues.buyingPrice * productValues.quantity - productValues.paidAmount;
      productValues.dueAmount = dueAmount; // Add due amount to product values

      if (editProduct) { // If we're editing an existing product
          productValues.productId = editProduct._id; // Set the product ID for updating
          await axios.put('/api/products/updateproducts', productValues); // Update product details

          const sellerId = sellerForm.getFieldValue('_id') || editProduct.sellerId;
          const updatedSellerValues = sellerForm.getFieldsValue(); // Get current seller form values

          // Only update the seller if changes are made in the sellerForm fields
          if (sellerId) {
              await axios.put(`/api/sellers/update/${sellerId}`, updatedSellerValues);
              message.success("Product and Seller information updated successfully!");
          } else {
              message.warning("Seller information not found for update.");
          }
      } else {
          // Logic for adding a new product and seller
          const totalInvestmentAmount = productValues.buyingPrice * productValues.quantity; // Calculate total investment based on quantity

          if (isExistingUserSelected) {
              const sellerId = sellerForm.getFieldValue('_id');
              productValues.sellerId = sellerId;
              await axios.post('/api/products/addproducts', productValues);
              message.success("Product saved under existing seller!");

              // Update the investment by adding the total investment amount
              await axios.post('/api/investment/add', { buyingPrice: totalInvestmentAmount });

              // Save due amount to Cashbook if any
              if (dueAmount > 0) {
                  await axios.post('/api/cashbook/add', {
                      type: "gaveMoney",
                      amount: dueAmount,
                      description: `Due for product ${productValues.name}`
                  });
              }
          } else {
              const sellerValues = await sellerForm.validateFields();
              const sellerResponse = await axios.post('/api/sellers/addseller', sellerValues);
              const sellerId = sellerResponse.data._id;
              productValues.sellerId = sellerId;
              await axios.post('/api/products/addproducts', productValues);
              message.success("Product and Seller Information Saved Successfully!");

              // Update the investment by adding the total investment amount
              await axios.post('/api/investment/add', { buyingPrice: totalInvestmentAmount });

              // Save due amount to Cashbook if any
              if (dueAmount > 0) {
                  await axios.post('/api/cashbook/add', {
                      type: "gaveMoney",
                      amount: dueAmount,
                      description: `Due for product ${productValues.name}`
                  });
              }
          }
      }

      // Refresh product list and reset forms
      getAllProducts();
      setPopModal(false);
      setEditProduct(null);
      productForm.resetFields();
      sellerForm.resetFields();
      setIsExistingUserSelected(false);
      dispatch({ type: "HIDE_LOADING" });
  } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Error saving product and seller information!");
      console.log(error);
  }
};


  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = productData.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };
  
  // Wrap handleFilterChange in useCallback to prevent re-rendering issues
const handleFilterChange = useCallback((filterType) => {
  setSelectedFilter(filterType); // Set the selected filter state

  let sortedData = [...productData];
  switch (filterType) {
    case 'new':
      sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'old':
      sortedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'lowPrice':
      sortedData.sort((a, b) => a.price - b.price);
      break;
    case 'highPrice':
      sortedData.sort((a, b) => b.price - a.price);
      break;
    default:
      sortedData = productData.filter((product) => product.category === filterType);
      break;
  }
  setFilteredProducts(sortedData);
}, [productData]); // Add productData as a dependency to ensure it stays updated

useEffect(() => {
  handleFilterChange("new"); // Set default filter to "New" on component load
}, [handleFilterChange]); // Add handleFilterChange to the dependency array


const filterMenu = (
  <Menu onClick={(e) => handleFilterChange(e.key)}>
    <Menu.Item key="new" className={selectedFilter === "new" ? "selected-filter" : ""}>New</Menu.Item>
    <Menu.Item key="old" className={selectedFilter === "old" ? "selected-filter" : ""}>Old</Menu.Item>
    <Menu.Item key="lowPrice" className={selectedFilter === "lowPrice" ? "selected-filter" : ""}>Low Price</Menu.Item>
    <Menu.Item key="highPrice" className={selectedFilter === "highPrice" ? "selected-filter" : ""}>High Price</Menu.Item>
    <Menu.Divider />
    {categories.map((category) => (
      <Menu.Item key={category} className={selectedFilter === category ? "selected-filter" : ""}>{category}</Menu.Item>
    ))}
  </Menu>
);

  
    




const handleEditProduct = useCallback((record) => {
  setEditProduct(record);
  productForm.setFieldsValue(record);

  if (record.seller) {
      sellerForm.setFieldsValue(record.seller);
  }
  setPopModal(true);
}, [productForm, sellerForm]); // Add dependencies


  const handleAddNew = () => {
    setEditProduct(null);           
    productForm.resetFields();       
    sellerForm.resetFields();        
    setIsExistingUserSelected(false); // Reset existing user selection status
    setPopModal(true);               
  };

  const handleModalClose = () => {
    setPopModal(false);              
    productForm.resetFields();       
    sellerForm.resetFields();        
    setIsExistingUserSelected(false); // Reset existing user selection status
  };

  

  

  // Handle Existing User selection to fill the form with full details and set restriction for toggle
  const handleExistingUserSelect = (seller) => {
    sellerForm.setFieldsValue({
      _id: seller._id, // Use seller ID for association
      name: seller.name,
      phone: seller.phone,
      address: seller.address,
      image: seller.image,
      cnic: seller.cnic,
      cnicImage1: seller.cnicImage1,
      cnicImage2: seller.cnicImage2,
    });
    setIsExistingUserSelected(true); // Mark as existing user selected
  };
  




  
  

  // Around line 164
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name", // **Add key**
  },
  {
    title: "Image",
    dataIndex: "image",
    key: "image", // **Add key**
    render: (image, record) => <img src={image} alt={record.name} height={60} width={60} />,
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price", // **Add key**
    render: (price) => `Rs. ${price}`,
  },
  {
    title: "Action",
    dataIndex: "_id",
    key: "action", // **Add key**
    render: (id, record) => (
      <div>
        <DeleteOutlined className='cart-action' onClick={() => handlerDelete(record)} />
        <EditOutlined className='cart-edit' onClick={() => handleEditProduct(record)} />
      </div>
    )
  }
];


useEffect(() => {
  if (product && seller && location.state?.triggerEdit) {
      handleEditProduct({
          ...product,
          seller, // Attach seller data
      });
  }
}, [product, seller, location.state?.triggerEdit, handleEditProduct]);






  return (
    <LayoutApp>
      <h2>All Products</h2>
      
      <Button className='add-new' onClick={handleAddNew}>Add New</Button>

      <div className="search-filter-container">
  <Input
    placeholder="Search by product name"
    prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
    value={searchQuery}
    onChange={handleSearch}
    className="search-bar"
  />
  <div className='filterz'>
  <Dropdown className="droplist" overlay={filterMenu} trigger={['hover']}>
  <FilterOutlined className="filterop"  style={{ fontSize: '20px', marginTop: '10px', cursor: 'pointer' }} />
</Dropdown>
</div>

</div>


<Table dataSource={filteredProducts} columns={columns} bordered />


      {popModal && (
        <Modal
          title="Product and Seller Information"
          visible={popModal}
          onCancel={handleModalClose}
          footer={null}
          width={1000}
        >
          <div className="form-container">
            <div className="product-form">
              <h3>{editProduct ? "Edit Product" : "Add New Product"}</h3>
              <Form form={productForm} layout='vertical'>
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem name="name" label="Name" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem name="image" label="Image URL">
                      <Input />
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Select
    showSearch // Enable search within dropdown
    placeholder="Select a category"
    optionFilterProp="children" // Filter options based on their children (text content)
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    } // Customize filter function
  >
  {categories.map((category) => (
    <Select.Option key={category} value={category}>{category}</Select.Option>
  ))}
</Select>

                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <FormItem name="quantity" label="Quantity" initialValue={1}>
                      <Input type="number" min={0} />
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem name="price" label="Price" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem name="buyingPrice" label="Buying Price" rules={[{ required: true }]}>
                      <Input type="number" min={0}/>
                    </FormItem>
                  </Col>
                </Row>
                <Form.Item name="imei1" label="IMEI Number 1">
                  <Input />
                </Form.Item>
                <Form.Item name="imei2" label="IMEI Number 2">
                  <Input />
                </Form.Item>
                
                
                <Row gutter={16} align="middle" justify="space-between">
  <Col span={12}>
    <FormItem name="paidAmount" label="Paid Amount" rules={[{ required: true }]}>
      <Input
        type="number"
        min={0}
        onChange={(e) => {
          const buyingPrice = productForm.getFieldValue('buyingPrice');
          const paidAmount = e.target.value;
          const dueAmount = buyingPrice - paidAmount;
          productForm.setFieldsValue({ dueAmount: dueAmount >= 0 ? dueAmount : 0 });
        }}
      />
    </FormItem>
  </Col>
  <Col span={12}>
    <FormItem name="dueAmount" label="Due Amount">
      <Input type="number" min={0} disabled />
    </FormItem>
  </Col>
</Row>


                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Form>
            </div>

            {/* Seller Info Form with New Buttons */}
            <div className="saler-form" style={{ position: 'relative' }}>
              <h3>Seller Info</h3>
              
              {/* Existing User Button with Hover Dropdown */}
              <Form.Item>
  <Select
    showSearch
    placeholder="Select or search seller"
    optionFilterProp="children"
    onChange={(value) => {
      const selectedSeller = sellers.find((seller) => seller._id === value);
      if (selectedSeller) {
        handleExistingUserSelect(selectedSeller);
      }
    }}
    filterOption={(input, option) =>
      (option?.label || '').toLowerCase().includes(input.toLowerCase())
    }
  >
    {sellers.map((seller) => (
      <Select.Option key={seller._id} value={seller._id} label={`${seller.name} - ${seller.phone}`}>
        {seller.name} - {seller.phone}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

              
              <Form form={sellerForm} layout='vertical'>
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem name="name" label="Name" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem name="phone" label="Phone" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                </Row>
                <FormItem name="address" label="Address" rules={[{ required: true }]}>
                  <Input />
                </FormItem>
                <FormItem name="image" label="Image Link" rules={[{ required: true }]}>
                  <Input />
                </FormItem>
                <FormItem name="cnic" label="CNIC Number" rules={[{ required: true }]}>
                  <Input />
                </FormItem>
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem name="cnicImage1" label="CNIC Image 1" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem name="cnicImage2" label="CNIC Image 2" rules={[{ required: true }]}>
                      <Input />
                    </FormItem>
                  </Col>
                </Row>
              </Form>

              
            </div>

            <div className="form-btn-add">
              <Button htmlType='button' className='add-new' onClick={handlerSubmit}>Save Product</Button>
            </div>
          </div>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default Products;
