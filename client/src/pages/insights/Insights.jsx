import React, { useState, useEffect } from 'react';
import LayoutApp from '../../components/Layout';
import axios from 'axios';
import './Insights.css';

const Insights = () => {
    const [earnings, setEarnings] = useState(0);
    const [profit, setProfit] = useState(0);
    const [investment, setInvestment] = useState(0); // New state for investment
    const [selectedOption, setSelectedOption] = useState('Today');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const earningsResponse = await axios.get('/api/earnings');
                setEarnings(earningsResponse.data.totalEarnings || 0);
                setProfit(earningsResponse.data.totalProfit || 0);

                // Fetch investment total from backend
                const investmentResponse = await axios.get('/api/investment');
                setInvestment(investmentResponse.data.totalInvestment || 0);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (
        <LayoutApp>
            <div className="insights-container">
                <h1 className="insights-title">Insights Page</h1>
                <div className="cardxs-container">
                    {/* Earnings Card */}
                    <div className="cardz gradient-cardz">
                        <div className="cardz-front">Earning</div>
                        <div className="cardz-back">RS. {earnings.toFixed(2)}</div>
                        <div className="dropdown-container">
                            <select className="dropdown" value={selectedOption} onChange={handleOptionChange}>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="This Year">This Year</option>
                                <option value="Entire">Entire</option>
                            </select>
                        </div>
                    </div>

                    {/* Profit Card */}
                    <div className="cardz cardz2">
                        <div className="cardz-front">Profit</div>
                        <div className="cardz-back">RS. {profit.toFixed(2)}</div>
                        <div className="dropdown-container">
                            <select className="dropdown" value={selectedOption} onChange={handleOptionChange}>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="This Year">This Year</option>
                                <option value="Entire">Entire</option>
                            </select>
                        </div>
                    </div>

                    {/* Invest Card */}
                    <div className="cardz cardz3">
                        <div className="cardz-front">Invest</div>
                        <div className="cardz-back">RS. {investment.toFixed(2)}</div>
                        <div className="dropdown-container">
                            <select className="dropdown" value={selectedOption} onChange={handleOptionChange}>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="This Year">This Year</option>
                                <option value="Entire">Entire</option>
                            </select>
                        </div>
                    </div>

                    {/* Placeholder Card 4 */}
                    <div className="cardz cardz4">
                        <div className="cardz-front">Cashbook</div>
                        <div className="cardz-back">RS. 0</div>
                        <div className="dropdown-container">
                            <select className="dropdown" value={selectedOption} onChange={handleOptionChange}>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="This Year">This Year</option>
                                <option value="Entire">Entire</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutApp>
    );
};

export default Insights;
