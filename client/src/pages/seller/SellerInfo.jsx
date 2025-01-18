import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, message, Modal, Button, Input, Dropdown, Menu } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'; // Import search and filter icons
import LayoutApp from '../../components/Layout';
import Product from '../../components/Product';
import './SellerInfo.css';

const SellerInfo = () => {
  const [sellerData, setSellerData] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/sellers/getsellers');
        setSellerData(response.data);
        setFilteredSellers(response.data);
        setLoading(false);
      } catch (error) {
        message.error("Error fetching seller information");
        setLoading(false);
      }
    };
    
    fetchSellerData();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredSellers(
      sellerData.filter(
        (seller) =>
          seller.name.toLowerCase().includes(query) ||
          seller.phone.includes(query) ||
          seller.address.toLowerCase().includes(query) ||
          seller.cnic.includes(query)
      )
    );
  };

  const fetchProductsBySeller = async (sellerId) => {
    try {
      const response = await axios.get(`/api/products/by-seller/${sellerId}`);
      setProductData((prevData) => ({ ...prevData, [sellerId]: response.data }));
    } catch (error) {
      console.error("Error fetching products for the seller:", error);
    }
  };

  const handleExpand = (expanded, record) => {
    if (expanded) {
      fetchProductsBySeller(record._id);
      setExpandedRowKeys([record._id]);
    } else {
      setExpandedRowKeys([]);
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

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsImageModalVisible(true);
  };

  const handleImageModalClose = () => {
    setIsImageModalVisible(false);
    setSelectedImage(null);
  };

  const handleFilterChange = (filterType) => {
    const sortedData = [...filteredSellers];
    switch (filterType) {
      case 'new':
        sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'older':
        sortedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    setFilteredSellers(sortedData);
  };

  const filterMenu = (
    <Menu onClick={(e) => handleFilterChange(e.key)}>
      <Menu.Item key="new">New</Menu.Item>
      <Menu.Item key="older">Older</Menu.Item>
    </Menu>
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Image', 
      dataIndex: 'image', 
      key: 'image', 
      render: (image) => image 
        ? <img src={image} alt="Seller" height={50} onClick={() => handleImageClick(image)} style={{ cursor: 'pointer' }} /> 
        : 'No image' 
    },
    { title: 'CNIC', dataIndex: 'cnic', key: 'cnic' },
    { 
      title: 'CNIC Image 1', 
      dataIndex: 'cnicImage1', 
      key: 'cnicImage1', 
      render: (cnicImage1) => cnicImage1 
        ? <img src={cnicImage1} alt="CNIC Front" height={50} onClick={() => handleImageClick(cnicImage1)} style={{ cursor: 'pointer' }} /> 
        : 'No CNIC Image 1' 
    },
    { 
      title: 'CNIC Image 2', 
      dataIndex: 'cnicImage2', 
      key: 'cnicImage2', 
      render: (cnicImage2) => cnicImage2 
        ? <img src={cnicImage2} alt="CNIC Back" height={50} onClick={() => handleImageClick(cnicImage2)} style={{ cursor: 'pointer' }} /> 
        : 'No CNIC Image 2' 
    },
  ];

  return (
    <LayoutApp>
      <div className="seller-info-page">
        <h2>Seller Information</h2>
        
        <div className="search-container">
          <Input
            placeholder="Search by name, phone, address, or CNIC"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            value={searchQuery}
            onChange={handleSearch}
            className="searchz-bar"
          />

          {/* Filter Icon with Dropdown */}
          <Dropdown className='droplist' overlay={filterMenu} trigger={['hover']}>
            <FilterOutlined className="filter-icon" style={{ fontSize: '20px',marginTop: '10px',color: '##0080f8', cursor: 'pointer' }} />
          </Dropdown>
        </div>

        <Table
          dataSource={filteredSellers}
          columns={columns}
          rowKey="_id"
          loading={loading}
          bordered
          expandable={{
            expandedRowRender: (record) => {
              const products = productData[record._id] || [];
              return (
                <div className="product-list">
                  {products.map((product) => (
                    <div key={product._id} className="product-item" onClick={() => handleProductClick(product)}>
                      <Product product={product} />
                    </div>
                  ))}
                </div>
              );
            },
            onExpand: handleExpand,
            expandedRowKeys: expandedRowKeys,
          }}
        />

        {/* Product and Image Modals */}
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

        <Modal visible={isImageModalVisible} onCancel={handleImageModalClose} footer={null} centered>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Zoomed view" 
              style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '8px' }} 
            />
          )}
        </Modal>
      </div>
    </LayoutApp>
  );
};

export default SellerInfo;
