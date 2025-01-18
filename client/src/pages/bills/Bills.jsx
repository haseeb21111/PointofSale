import { Button, Modal, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { EyeOutlined, EditOutlined  } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import Layout from '../../components/Layout';
import { Input, Dropdown, Menu } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Bills.css';

const Bills = () => {
    const navigate = useNavigate();
    const componentRef = useRef();
    const dispatch = useDispatch();
    const [billsData, setBillsData] = useState([]);
    const [popModal, setPopModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('new');
    const [filteredData, setFilteredData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Search and filter function
    const applyFilters = useCallback((query, filter) => {
        let filtered = [...billsData]; // Create a new array copy

        // Apply search filter
        if (query) {
            filtered = filtered.filter(
                (bill) =>
                    bill._id.toLowerCase().includes(query) ||
                    bill.customerName.toLowerCase().includes(query) ||
                    String(bill.customerPhone).includes(query) ||
                    bill.customerAddress.toLowerCase().includes(query)
            );
        }

        // Apply 'new' or 'old' filter based on createdAt date
        if (filter === 'new') {
            filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filter === 'old') {
            filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        console.log("Filtered Data:", filtered); // Debug: Check if sorting is working as expected
        setFilteredData(filtered);
    }, [billsData]);

    // Fetch all bills
    const getAllBills = useCallback(async () => {
        try {
            dispatch({ type: "SHOW_LOADING" });
            const { data } = await axios.get('/api/bills/getbills'); // Fetch ungrouped data
            setBillsData(data || []); // Use ungrouped bills data
            dispatch({ type: "HIDE_LOADING" });
        } catch (error) {
            dispatch({ type: "HIDE_LOADING" });
            console.error(error);
        }
    }, [dispatch]);
    
    

    useEffect(() => {
        getAllBills();
    }, [getAllBills]);

    useEffect(() => {
        applyFilters(searchQuery, filterType);
    }, [billsData, applyFilters, filterType, searchQuery]);

    // Search handler
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        applyFilters(query, filterType);
    };

    // Filter change handler
    const handleFilterChange = ({ key }) => {
        console.log("Selected Filter:", key); // Debug: Ensure the correct filter type is passed
        setFilterType(key);
        applyFilters(searchQuery, key);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "index",
            render: (text, record, index) => {
                const currentPage = pagination.current || 1;
                const pageSize = pagination.pageSize || 10;
                return (currentPage - 1) * pageSize + index + 1;
            },
        },
        { title: "Customer Name", dataIndex: "customerName" },
        { title: "Contact Number", dataIndex: "customerPhone" },
        { title: "Customer Address", dataIndex: "customerAddress" },
        { title: "Sub Total", dataIndex: "subTotal" },
        { title: "Tax", dataIndex: "tax" },
        { title: "Total Amount", dataIndex: "totalAmount" },
        {
            title: "Action",
            dataIndex: "_id",
            render: (id, record) => (
                <div>
                    <EyeOutlined className='cart-edit eye' onClick={() => { setSelectedBill(record); setPopModal(true); }} />
                    <EditOutlined
    className='cart-edit edit'
    onClick={() => {
        navigate(
            `/cart?edit=true&id=${record._id}&customerName=${record.customerName}&customerPhone=${record.customerPhone}&customerAddress=${record.customerAddress}&customerCNIC=${record.customerCNIC}&tax=${record.tax}&discount=${record.discount}&paymentMethod=${record.paymentMethod}&paidAmount=${record.paidAmount}&remainingAmount=${record.remainingAmount}`
        );
    }}
/>
                </div>
            ),
        }
    ];

    return (
        <Layout>
            <div className="header-containerd">
                <h2 className="header-title">All Invoices</h2>
                <div className="search-filter-containerd">
                    <Input
                        placeholder="Search by ID, Customer Name, Contact Number, or Address"
                        prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-bard"
                    />
                    <Dropdown
                        overlay={
                            <Menu 
                                onClick={handleFilterChange}
                                items={[
                                    { key: 'new', label: 'New' },
                                    { key: 'old', label: 'Old' }
                                ]}
                            />
                        }
                        trigger={['hover']}
                    >
                        <FilterOutlined
                            className="filter-icond"
                            style={{ fontSize: '20px', cursor: 'pointer', marginLeft: '10px' }}
                        />
                    </Dropdown>
                </div>
            </div>

            <Table
                dataSource={filteredData}
                columns={columns}
                bordered
                pagination={pagination}
                onChange={handleTableChange}
            />

{popModal &&
    <Modal title="Invoice Details" width={400} pagination={false} visible={popModal} onCancel={() => setPopModal(false)} footer={false}>
        <div className="card" ref={componentRef}>
            <div className="cardHeader">
                <h2 className="logo">XYZ Mobiles Shop</h2>
                <span>Number: <b>03100002904</b></span>
                <span>Address: <b>XYZ Mobiles, Near XYZ</b></span>
            </div>
            <div className="cardBody">
                <div className="group"><span>Customer Name:</span><span><b>{selectedBill.customerName}</b></span></div>
                <div className="group"><span>Customer Phone:</span><span><b>{selectedBill.customerPhone}</b></span></div>
                <div className="group"><span>Customer Address:</span><span><b>{selectedBill.customerAddress}</b></span></div>
                <div className="group"><span>Date Order:</span><span><b>{selectedBill.createdAt?.substring(0, 10)}</b></span></div>
            </div>
            
            <div className="cardFooter">
                <h4>Your Order</h4>
                {selectedBill.cartItems.map((product, index) => (
                    <div key={index} className="footerCard">
                        <div className="group"><span>Product:</span><span><b>{product.name}</b></span></div>
                        <div className="group"><span>Qty:</span><span><b>{product.quantity}</b></span></div>
                        <div className="group"><span>Price:</span><span><b>Rs. {product.price}</b></span></div>
                    </div>
                ))}
                
                {/* Summary Section */}
                <div className="summarySection">
                    <div className="group"><span>Sub Total:</span><span><b>Rs. {selectedBill.subTotal}</b></span></div>
                    <div className="group"><span>Tax:</span><span><b>Rs. {selectedBill.tax}</b></span></div>
                    <div className="group"><span>Discount:</span><span><b>Rs. {selectedBill.discount || 0}</b></span></div>
                    <hr />
                    <div className="group"><h3>Total:</h3><h3><b>Rs. {selectedBill.totalAmount}</b></h3></div>
                    <div className="group"><span>Paid:</span><span><b>Rs. {selectedBill.paidAmount || 0}</b></span></div>
                    <div className="group"><span>Due:</span><span><b>Rs. {selectedBill.totalAmount - (selectedBill.paidAmount || 0)}</b></span></div>
                </div>
                
                <div className="footerThanks"><span>Thank You for buying from us</span></div>
            </div>
        </div>
        <div className="bills-btn-add">
            <Button onClick={handlePrint} htmlType='submit' className='add-new'>Generate Invoice</Button>
        </div>
    </Modal>
}

            
        </Layout>
    );
};

export default Bills;
