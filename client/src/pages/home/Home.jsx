import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import LayoutApp from '../../components/Layout';
import { Button, Modal, Input, message, Dropdown, Menu } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import Product from '../../components/Product';
import { useCategories } from '../../context/CategoryContext';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);

  const { categories, addCategory } = useCategories();

  const getAllProducts = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/products/getproducts');
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const filterProductsByCategory = (category) => {
    if (category) {
      setFilteredProducts(products.filter((product) => product.category === category));
    } else {
      setFilteredProducts(products);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterType) => {
    let sortedData = [...products];
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
        sortedData = products.filter((product) => product.category === filterType);
        break;
    }
    setFilteredProducts(sortedData);
  };

  const filterMenu = (
    <Menu onClick={(e) => handleFilterChange(e.key)}>
      <Menu.Item key="new">New</Menu.Item>
      <Menu.Item key="old">Old</Menu.Item>
      <Menu.Item key="lowPrice">Low Price</Menu.Item>
      <Menu.Item key="highPrice">High Price</Menu.Item>
      <Menu.Divider />
    </Menu>
  );

  const showAddCategoryModal = () => {
    setIsModalVisible(true);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      addCategory(newCategory);
      setNewCategory('');
      setIsModalVisible(false);
      message.success("Category added successfully!");
    } else {
      message.error("Category already exists or is empty!");
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalVisible(true);
  };

  const handleProductModalClose = () => {
    setIsProductModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <LayoutApp>
            <div className="header-container">
        <h2>Product Categories</h2>
        <div className="header-right" style={{ position: 'absolute', top: '105px', right: '40px', backgroundColor: '#f0f2f5', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
          <span className="product-count">Products: {filteredProducts.length}</span>
        </div>
        <div className="search-filter-containerp">
          <Input
            placeholder="Search by product name"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            value={searchQuery}
            onChange={handleSearch}
            className="search-bar"
          />
          <Dropdown className='dropdownn' overlay={filterMenu} trigger={['hover']}>
            <FilterOutlined className="filter-icon" style={{ fontSize: '20px', cursor: 'pointer', marginLeft: '10px' }} />
          </Dropdown>
        </div>
      </div>


      <div className="category-buttons">
        {categories.map((category, index) => (
          <Button key={index} onClick={() => filterProductsByCategory(category)}>{category}</Button>
        ))}
        <Button onClick={() => filterProductsByCategory(null)}>All Products</Button>
        <Button onClick={showAddCategoryModal} className="add-category-button">+</Button>
      </div>

      <div className="product-list">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-item" onClick={() => handleProductClick(product)}>
            <Product product={product} />
          </div>
        ))}
      </div>

      <Modal
        title={selectedProduct?.name}
        visible={isProductModalVisible}
        onCancel={handleProductModalClose}
        footer={<Button key="close" onClick={handleProductModalClose}>Close</Button>}
      >
        {selectedProduct && (
          <div>
            {selectedProduct.image && (
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                style={{
                  width: '470px',
                  height: '470px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginTop: '10px'
                }} 
              />
            )}
            <p><strong>Category:</strong> {selectedProduct.category}</p>
            <p><strong>Price:</strong> Rs. {selectedProduct.price}</p>
            <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
            <p><strong>Buying Price:</strong> Rs. {selectedProduct.buyingPrice}</p>
            <p><strong>IMEI 1:</strong> {selectedProduct.imei1}</p>
            <p><strong>IMEI 2:</strong> {selectedProduct.imei2}</p>
            <div className="description-box">
              <h3>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProduct.description || "No description available"}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onOk={handleAddCategory}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Enter new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </Modal>
    </LayoutApp>
  );
};

export default Home;
