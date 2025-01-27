import { Button, Form, Input, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import {  Link, useNavigate } from 'react-router-dom';
import adminLogo from '../../../src/components/assets/AdminLogo.png';

import './Login.css'; // Is file mein CSS likhein agar styling chahiye

const Login = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlerSubmit = async (value) => {
    //console.log(value);
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const res = await axios.post('/api/users/login', value);
      dispatch({
        type: "HIDE_LOADING",
      });
      message.success("User Login Successfully!");
      localStorage.setItem("auth", JSON.stringify(res.data));
      navigate("/");
      

    } catch(error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      message.error("Error!")
      console.log(error);
    }
  }

  useEffect(() => {
    if(localStorage.getItem("auth")) {
      localStorage.getItem("auth");
      navigate("/");
    }
    
  }, [navigate]);

  return (
    <div className="login-container">
      <Link to="/admin" className="admin-logo">
        <img 
          src={adminLogo}
          alt="Admin Logo" 
          className="logo-image" 
        />
      </Link>
      <div className="login-card">
        <h2>POS SYSTEM</h2>
        <p>Login</p>
        
          <Form layout='vertical' onFinish={handlerSubmit}>
            <FormItem name="userId" label="Email Address">
              <Input placeholder='Enter Email Address'/>
            </FormItem>
            <FormItem name="password" label="Password">
              <Input type="password" placeholder='Enter Password'/>
            </FormItem>
            <div className="form-btn-add">
              <Button htmlType='submit' className="login-button">Login</Button>
              
            </div>
          </Form>
        </div>
        </div>
    
  )
}

export default Login
