import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { DeleteOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Table, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './cart.css';

const Cart = () => {
    const [form] = Form.useForm();
    const [subTotal, setSubTotal] = useState(0);
    const [billPopUp, setBillPopUp] = useState(false);
    const [taxInput, setTaxInput] = useState(0);
    const [isPercentage, setIsPercentage] = useState(false); // Default to Fixed Amount
    const [discount, setDiscount] = useState(0);
    const [isCredit, setIsCredit] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [invoices, setInvoices] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.rootReducer);

    const totalAmount = (
        subTotal +
        (isPercentage ? subTotal * (taxInput / 100) : taxInput) -
        discount
    ).toFixed(2);

    const handlerIncrement = (record) => {
        dispatch({
            type: 'UPDATE_CART',
            payload: { ...record, quantity: record.quantity + 1 },
        });
    };

    const handlerDecrement = (record) => {
        if (record.quantity !== 1) {
            dispatch({
                type: 'UPDATE_CART',
                payload: { ...record, quantity: record.quantity - 1 },
            });
        }
    };

    const handlePaymentMethodChange = (value) => {
        if (value === 'borrow') {
            setIsCredit(true);
            setRemainingAmount(totalAmount);
        } else {
            setIsCredit(false);
            setPaidAmount(0);
            setRemainingAmount(0);
        }
    };

    const handlerDelete = (record) => {
        dispatch({
            type: 'DELETE_FROM_CART',
            payload: record,
        });
    };

const saveFormState = (form) => {
    localStorage.setItem('cartFormData', JSON.stringify(form.getFieldsValue()));
};

const restoreFormState = (form) => {
    const savedData = localStorage.getItem('cartFormData');
    if (savedData) {
        form.setFieldsValue(JSON.parse(savedData));
    }
};

const openModal = () => {
    restoreFormState(form); // Restore form state before opening the modal
    setBillPopUp(true); // Open the modal
};

const closeModal = () => {
    saveFormState(form); // Save form state before closing the modal
    setBillPopUp(false); // Close the modal
};
const handleReset = () => {
    // Clear the cart items from Redux state
    dispatch({ type: "CLEAR_CART" });

    // Reset the form fields
    form.resetFields();

    // Clear saved form data from localStorage
    localStorage.removeItem("cartFormData");

    // Reset additional state variables if necessary
    setPaidAmount(0);
    setRemainingAmount(0);
    setTaxInput(0);
    setDiscount(0);
    setIsCredit(false);

    message.success("Form and cart have been reset!");
};
const handleInvoiceSelect = async (value) => {
    try {
        const { data } = await axios.get(`/api/bills/${value}`);
        form.setFieldsValue({
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            customerCNIC: data.customerCNIC,
        });
    } catch (error) {
        console.error('Error fetching bill details:', error);
        message.error('Failed to load customer details');
    }
};



    
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Image',
            dataIndex: 'image',
            render: (image, record) => (
                <img src={image} alt={record.name} height={60} width={60} />
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
        },
        {
            title: 'Quantity',
            dataIndex: '_id',
            render: (id, record) => (
                <div>
                    <MinusCircleOutlined
                        className="cart-minus"
                        onClick={() => handlerDecrement(record)}
                    />
                    <strong className="cart-quantity">{record.quantity}</strong>
                    <PlusCircleOutlined
                        className="cart-plus"
                        onClick={() => handlerIncrement(record)}
                    />
                </div>
            ),
        },
        {
            title: 'Action',
            dataIndex: '_id',
            render: (id, record) => (
                <DeleteOutlined
                    className="cart-action"
                    onClick={() => handlerDelete(record)}
                />
            ),
        },
    ];

    useEffect(() => {
        let temp = 0;
        cartItems.forEach((product) => (temp += product.price * product.quantity));
        setSubTotal(temp);
    }, [cartItems]);

    useEffect(() => {
        // Restore form state when the page loads
        restoreFormState(form);
    }, [form]);
    

    
    useEffect(() => {
        const fetchCustomerBill = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get("edit") === "true") {
                const billId = queryParams.get("id");
    
                try {
                    const { data } = await axios.get(`/api/bills/${billId}`);
                    
                    // Update cartItems in redux state
                    dispatch({ type: "SET_CART_ITEMS", payload: data.cartItems });
    
                    // Set form values
                    form.setFieldsValue({
                        customerName: data.customerName || "",
                        customerPhone: data.customerPhone || "",
                        customerAddress: data.customerAddress || "",
                        customerCNIC: data.customerCNIC || "",
                        tax: data.tax || 0,
                        discount: data.discount || 0,
                        paymentMethod: data.paymentMethod || "Cash",
                        paidAmount: data.paidAmount || 0,
                        remainingAmount: data.remainingAmount || 0,
                    });
    
                    // Calculate and set SubTotal
                    const tempSubTotal = data.cartItems.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                    );
                    setSubTotal(tempSubTotal);
    
                    // Set other states
                    setTaxInput(data.tax || 0);
                    setDiscount(data.discount || 0);
                    setPaidAmount(data.paidAmount || 0);
                    setRemainingAmount(data.remainingAmount || 0);
                    setIsCredit(data.paymentMethod === "Credit");
                } catch (error) {
                    console.error("Error fetching bill data:", error);
                    message.error("Error fetching customer bill!");
                }
            }
        };
    
        fetchCustomerBill();
    }, [dispatch, form]);
    
    const navigateToHome = () => {
        navigate('/'); // Navigate to the Home page
    };
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const { data } = await axios.get('/api/bills/getbills');
                setInvoices(data);
            } catch (error) {
                console.error('Error fetching invoices:', error);
                message.error('Failed to fetch invoices');
            }
        };
        fetchInvoices();
    }, []);

    const handlerSubmit = async (value) => {
        console.log('Form values on submit:', form.getFieldsValue());
        try {
            localStorage.removeItem('cartFormData');

            const tax = isPercentage ? subTotal * (taxInput / 100) : taxInput;
            const totalBeforeDiscount = subTotal + tax;
            const calculatedTotalAmount = totalBeforeDiscount - discount;
    
            // Ensure buyingPrice is calculated for all items
            let totalBuyingPrice = 0;
            cartItems.forEach((item) => {
                if (!item.buyingPrice) {
                    console.error(`Missing buyingPrice for item: ${item.name}`);
                }
                totalBuyingPrice += item.buyingPrice * item.quantity; // Sum up total buying price
            });
    
            // Initialize earnings and profit
            let earnings = 0;
            let profit = 0;
    
            if (isCredit) {
                earnings = paidAmount;
                profit = paidAmount > totalBuyingPrice
                    ? paidAmount - totalBuyingPrice
                    : 0; // Only calculate profit if paidAmount > buyingPrice
            } else {
                earnings = calculatedTotalAmount;
                profit = calculatedTotalAmount > totalBuyingPrice
                    ? calculatedTotalAmount - totalBuyingPrice
                    : 0; // Only calculate profit if totalAmount > buyingPrice
            }
    
            // Prepare the data for API call
            const isEditMode = new URLSearchParams(window.location.search).get("edit") === "true";
            const billData = {
                ...value,
                cartItems, // Ensure cartItems contain the necessary fields, including buyingPrice
                subTotal,
                discount: discount.toFixed(2),
                tax: tax.toFixed(2),
                totalAmount: calculatedTotalAmount.toFixed(2),
                profit: profit.toFixed(2),
                earnings: earnings.toFixed(2),
                paymentMethod: isCredit ? "credit" : "cash",
                paidAmount: isCredit ? paidAmount : calculatedTotalAmount,
                remainingAmount: isCredit
                    ? calculatedTotalAmount - paidAmount
                    : 0,
            };
    
            // Log data being sent for debugging
            console.log("Payload being sent to backend:", billData);
    
            // Send data to backend
            if (isEditMode) {
                const id = new URLSearchParams(window.location.search).get("id");
                await axios.put(`/api/bills/updatebill`, { ...billData, _id: id });
                message.success("Bill updated successfully!");
            } else {
                await axios.post("/api/bills/addbills", billData);
                message.success("Bill created successfully!");
            }
            form.resetFields();
            // Clear the cart and navigate back to bills
            dispatch({ type: "CLEAR_CART" });
            navigate("/bills");
        } catch (error) {
            // Handle errors
            message.error("Error processing the bill!");
            console.error("Error details:", error);
        }
    };
    
    
    
    
    

    return (
        <Layout>
            <h2>Cart</h2>
            <div className="reset-button-container" style={{ marginTop: '-40px', float: 'right' }}>
    <Button 
        type="primary" 
        danger 
        onClick={handleReset} 
        className="reset-button"
    >
        Reset
    </Button>
</div>

            <Table dataSource={cartItems} columns={columns} bordered />

            <div className="cart-center-icon">
    <PlusCircleOutlined
        style={{
            fontSize: '50px', // Set initial font size
            color: '#B7B7B7',
            cursor: 'pointer',
            display: 'block',
            transform: 'scale(4)', // Scale the icon to make it larger
            transformOrigin: 'center', // Ensure it scales from the center
            marginTop: '30px',
        }}
        onClick={navigateToHome} // Navigate to Home page
    />
</div>



            <div className="subTotal">
                <h2>
                    Sub Total: <span>Rs {subTotal.toFixed(2)}</span>
                </h2>
                <Button onClick={openModal} className="add-new">
    Create Invoice
</Button>


            </div>
            <Modal
    title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Create Invoice</h3>
            
            <Select
    showSearch
    placeholder="Select or search Invoice"
    style={{ width: 250, right: '20%' }}
    optionFilterProp="children"
    filterOption={(input, option) =>
        (option?.label || '').toLowerCase().includes(input.toLowerCase())
    }
    onChange={handleInvoiceSelect}
>
    {invoices.map((invoice) => (
        <Select.Option key={invoice._id} value={invoice._id} label={`${invoice.customerName} - ${invoice.customerPhone}`}>
            {invoice.customerName} - {invoice.customerPhone}
        </Select.Option>
    ))}
</Select>

                            
                        </div>
                    
    }
    visible={billPopUp}
    onCancel={closeModal} // Use the updated closeModal function
    footer={false}
    
>

                <Form layout="vertical" onFinish={handlerSubmit} form={form}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="customerName"
                                label="Customer Name"
                                rules={[{ required: true, message: 'Please enter customer name' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="customerPhone"
                                label="Customer Phone"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="customerAddress"
                        label="Customer Address"
                        rules={[{ required: true, message: 'Please enter Address' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="customerCNIC" label="Customer CNIC (optional)">
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Tax Type">
                                <Select
                                    value={isPercentage ? 'percentage' : 'fixed'}
                                    onChange={(value) => setIsPercentage(value === 'percentage')}
                                    defaultValue="fixed" // Default to Fixed Amount
                                >
                                    <Select.Option value="percentage">Percentage</Select.Option>
                                    <Select.Option value="fixed">Fixed Amount</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Tax Amount (optional)">
                                <Input
                                    type="number"
                                    value={taxInput}
                                    onChange={(e) => setTaxInput(Number(e.target.value))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Discount Rate (optional)">
                                <Input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="paymentMethod"
                                label="Payment Method"
                                rules={[{ required: true }]}
                            >
                                <Select onChange={handlePaymentMethodChange}>
                                    <Select.Option value="cash">Cash</Select.Option>
                                    <Select.Option value="borrow">Credit</Select.Option>
                                </Select>
                            </Form.Item>
                            {isCredit && (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Paid Amount">
                                            <Input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => {
                                                    const paid = Number(e.target.value);
                                                    setPaidAmount(paid);
                                                    setRemainingAmount(totalAmount - paid);
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Remaining Amount">
                                            <Input value={remainingAmount} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                    </Row>
                    <div className="total">
                        <span>SubTotal: Rs {subTotal.toFixed(2)}</span>
                        <br />
                        <span>Tax: Rs {isPercentage ? `${taxInput}%` : `${taxInput.toFixed(2)}`}</span>
                        <br />
                        <span>Discount: Rs {discount.toFixed(2)}</span>
                        <h3>Total: Rs {totalAmount}</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <Button
                            type="default"
                            onClick={() => form.resetFields()}
                            style={{ color: '#1890ff', textDecoration: 'underline' }}
                        >
                            Reset Form
                        </Button>
                        <Button type="primary" htmlType="submit" className="add-new">
                            Generate Invoice
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default Cart;
