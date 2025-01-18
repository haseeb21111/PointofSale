import React from 'react';
import { Button, Card } from 'antd';
import { useDispatch } from 'react-redux';
import './Product.css';

const Product = ({ product, onCardClick }) => {
  const dispatch = useDispatch();

  const handlerToCart = (e) => {
    e.stopPropagation(); // Prevents card click event from firing
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...product, quantity: 1 }
    });
  };

  const { Meta } = Card;

  return (
    <Card
      hoverable
      style={{ width: 240, marginBottom: 30 }}
      onClick={onCardClick} // Pass the card click event handler
      cover={
        <div className="image-container">
          <img alt={product.name} src={product.image} className="product-image" />
        </div>
      }
    >
      <Meta title={product.name} description={`Rs. ${product.price}`} />
      <div className="product-btn">
        <Button onClick={handlerToCart} className="add-to-cart-btn">Add To Cart</Button>
      </div>
    </Card>
  );
};

export default Product;
