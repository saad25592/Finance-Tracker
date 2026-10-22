import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:3000/transaction'
const GENERAL_EXPENSE = 'General Expense'

function App() {
  const [transactions, setTransactions] = useState([])
  const [formData, setFormData] = useState({ title: '', amount: '', type: 'expense', source: 'Personal', date: '' })
  
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('personalBudget');
    return savedBudget ? Number(savedBudget) : 35000;
  });
  
  const [alertShown, setAlertShown] = useState({ eighty: false, hundred: false })
  const [activeTab, setActiveTab] = useState('personal')

  const [bizRecordType, setBizRecordType] = useState('Profit')

  const defaultInvestments = {
    "Import & Export Trading": 150000,
    "Motorcycle Rental Service": 30000,
    "Tobacco Products Trading": 20000,
    "Shrimp Trading & Supply": 30000,
    "Grocery & General Store": 50000
  };

  const [fixedInvestments, setFixedInvestments] = useState(() => {
    const saved = localStorage.getItem('businessInvestments');
    return saved ? JSON.parse(saved) : defaultInvestments;
  });

  const [closedBusinesses, setClosedBusinesses] = useState(() => {
    const savedClosed = localStorage.getItem('closedBusinesses');
    return savedClosed ? JSON.parse(savedClosed) : [];
  });

  const [showAddBiz, setShowAddBiz] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizInvest, setNewBizInvest] = useState('');

  useEffect(() => {
    localStorage.setItem('personalBudget', budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('businessInvestments', JSON.stringify(fixedInvestments));
  }, [fixedInvestments]);

  useEffect(() => {
    localStorage.setItem('closedBusinesses', JSON.stringify(closedBusinesses));
  }, [closedBusinesses]);

  const businessList = Object.keys(fixedInvestments);
  const activeBizList = businessList.filter(b => !closedBusinesses.includes(b));
  const closedBizList = businessList.filter(b => closedBusinesses.includes(b));

  const totalActiveInvestment = activeBizList.reduce((a, b) => a + Number(fixedInvestments[b]), 0);

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL)
      setTransactions(res.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'title' && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setBizRecordType('Profit'); 
    setFormData({
      title: '',
      amount: '',
      type: tab === 'personal' ? 'expense' : 'income', 
      source: tab === 'personal' ? 'Personal' : (activeBizList[0] || ''),
      date: ''
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isGeneralExpense = activeTab === 'business' && bizRecordType === 'Expense';

    if (activeTab === 'business' && !isGeneralExpense && activeBizList.length === 0) {
      alert("Please add an active business first!");
      return;
    }

    try {
      const submitData = {
        ...formData,
        amount: Number(formData.amount),
        type: activeTab === 'business'
          ? (bizRecordType === 'Profit' ? 'income' : 'expense')
          : 'expense',
        source: activeTab === 'business'
          ? (isGeneralExpense ? GENERAL_EXPENSE : formData.source)
          : 'Personal',
        title: activeTab === 'business'
          ? (isGeneralExpense ? formData.title : `${formData.source} - ${bizRecordType}`)
          : formData.title
      };

      await axios.post(API_URL, submitData)

      const defaultSource = activeTab === 'personal'
        ? 'Personal'
        : (activeBizList.includes(formData.source) ? formData.source : (activeBizList[0] || ''));
      
      setFormData({ 
        title: '', 
        amount: '', 
        type: activeTab === 'personal' ? 'expense' : 'income', 
        source: defaultSource, 
        date: '' 
      })
      setBizRecordType('Profit');
      fetchTransactions()
    } catch (error) {
      console.error("Error adding data:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      fetchTransactions()
    } catch (error) {
      console.error("Error deleting data:", error)
    }
  }

  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (newBizName && newBizInvest) {
      setFixedInvestments({
        ...fixedInvestments,
        [newBizName]: Number(newBizInvest)
      });
      if (closedBusinesses.includes(newBizName)) {
        setClosedBusinesses(closedBusinesses.filter(b => b !== newBizName));
      }
      setNewBizName('');
      setNewBizInvest('');
      setShowAddBiz(false);
    }
  };

  const toggleBusinessStatus = (bizName) => {
    if (closedBusinesses.includes(bizName)) {
      setClosedBusinesses(closedBusinesses.filter(b => b !== bizName));
    } else {
      if (window.confirm(`Are you sure you want to withdraw investment and close '${bizName}'?`)) {
        setClosedBusinesses([...closedBusinesses, bizName]);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const personalTx = transactions.filter(t => t.source === 'Personal' || !t.source);
  const generalExpenseTx = transactions.filter(t => t.source === GENERAL_EXPENSE);
  const businessTx = transactions.filter(t => t.source !== 'Personal' && t.source && t.source !== GENERAL_EXPENSE);

  const personalExpense = personalTx.filter(t => t.type === 'expense').reduce((acc, item) => acc + Number(item.amount), 0);
  const personalBalance = budget - personalExpense;
  const expensePercentage = budget > 0 ? (personalExpense / budget) * 100 : 0;

  const totalBusinessProfit = businessTx.reduce((acc, item) => {
    return item.type === 'income' ? acc + Number(item.amount) : acc - Number(item.amount);
  }, 0);

  const totalGeneralExpense = generalExpenseTx.reduce((acc, t) => acc + Number(t.amount), 0);
  const netBusinessProfit = totalBusinessProfit - totalGeneralExpense;

  useEffect(() => {
    if (activeTab !== 'personal') return;

    // আইওএস সাপোর্ট এবং ব্রাউজার পলিসির জন্য .mp3 সাউন্ড ব্যবহার করা হলো
    const playSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(err => console.log("Please click anywhere on the page to allow audio playback.", err));
    };

    if (expensePercentage >= 100 && !alertShown.hundred) {
      playSound();
      setTimeout(() => { window.alert("🚨 DANGER: You have exceeded your 100% monthly budget limit!"); }, 500);
      setAlertShown({ eighty: true, hundred: true });
    }
    else if (expensePercentage >= 80 && expensePercentage < 100 && !alertShown.eighty) {
      playSound();
      setTimeout(() => { window.alert("⚠️ WARNING: You have reached 80% of your monthly budget!"); }, 500);
      setAlertShown(prev => ({ ...prev, eighty: true }));
    }
    else if (expensePercentage < 80) {
      setAlertShown({ eighty: false, hundred: false });
    }
  }, [expensePercentage, alertShown, activeTab]);

  const displayTransactions = activeTab === 'personal'
    ? [...personalTx].sort((a, b) => b.id - a.id)
    : [...businessTx, ...generalExpenseTx].sort((a, b) => b.id - a.id);

  return (
    <div className="container">
      <h2>Finance Tracker</h2>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => handleTabChange('personal')}>
          👤 Personal
        </button>
        <button className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => handleTabChange('business')}>
          💼 Business
        </button>
      </div>

      {activeTab === 'personal' ? (
        <div>
          <div className="dashboard">
            <div className="balance-card">
              <h4>Current Balance</h4>
              <h1 style={{ color: personalBalance >= 0 ? '#10b981' : '#ef4444' }}>৳{personalBalance}</h1>
            </div>
            <div className="summary">
              <div className="summary-item expense-box" style={{ width: '100%' }}>
                <h5>Total Expense</h5>
                <p>- ৳{personalExpense}</p>
              </div>
            </div>
          </div>
          <div className="budget-section">
            <div className="budget-header">
              <h4>Monthly Budget Limit</h4>
              <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="budget-input" />
            </div>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${Math.min(expensePercentage, 100)}%`, backgroundColor: expensePercentage >= 100 ? '#ef4444' : expensePercentage >= 80 ? '#f59e0b' : '#10b981' }}></div>
            </div>
            <p className="budget-text">{expensePercentage.toFixed(1)}% of ৳{budget} used</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="dashboard business-dashboard">
            <div className="balance-card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <h4 style={{ color: netBusinessProfit >= 0 ? '#1d4ed8' : '#ef4444' }}>
                Total Net Profit
              </h4>
              <h1 style={{ color: netBusinessProfit >= 0 ? '#1d4ed8' : '#ef4444' }}>
                {netBusinessProfit >= 0 ? '' : '-'}৳{Math.abs(netBusinessProfit)}
              </h1>
            </div>
            <div className="summary">
              <div className="summary-item" style={{ backgroundColor: '#f8fafc' }}>
                <h5>Total Active Investment</h5>
                <p style={{ color: '#475569' }}>৳{totalActiveInvestment}</p>
              </div>
              <div className="summary-item expense-box">
                <h5>General Expenses</h5>
                <p>- ৳{totalGeneralExpense}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', color: '#374151', margin: 0 }}>Active Business Breakdown</h3>
            <button
              onClick={() => setShowAddBiz(!showAddBiz)}
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {showAddBiz ? 'Close Form' : '+ Add New Business'}
            </button>
          </div>

          {showAddBiz && (
            <form onSubmit={handleAddBusiness} style={{ display: 'flex', gap: '10px', marginBottom: '15px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input type="text" placeholder="Business Name" value={newBizName} onChange={e => setNewBizName(e.target.value)} required style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="number" placeholder="Investment" value={newBizInvest} onChange={e => setNewBizInvest(e.target.value)} required style={{ width: '120px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
            </form>
          )}

          <div className="biz-stats">
            {activeBizList.map(source => {
              const bizProfit = businessTx.filter(t => t.source === source).reduce((a, b) => {
                return b.type === 'income' ? a + Number(b.amount) : a - Number(b.amount);
              }, 0);

              return (
                <div key={source} className="biz-card" style={{ position: 'relative' }}>
                  <button onClick={() => toggleBusinessStatus(source)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}>
                    Withdraw
                  </button>
                  <h6 style={{ fontSize: '14px', fontWeight: 'bold', paddingRight: '60px' }}>{source}</h6>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#64748b' }}>Investment: ৳{fixedInvestments[source]}</p>
                  <span style={{ color: bizProfit >= 0 ? '#10b981' : '#ef4444', display: 'block', marginTop: '5px' }}>
                    Net {bizProfit >= 0 ? 'Profit' : 'Loss'}: ৳{Math.abs(bizProfit)}
                  </span>
                </div>
              )
            })}
          </div>

          {closedBizList.length > 0 && (
            <div style={{ marginTop: '25px' }}>
              <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                Closed / Withdrawn Businesses
              </h3>
              <div className="biz-stats" style={{ opacity: '0.7' }}>
                {closedBizList.map(source => {
                  const bizProfit = businessTx.filter(t => t.source === source).reduce((a, b) => {
                    return b.type === 'income' ? a + Number(b.amount) : a - Number(b.amount);
                  }, 0);

                  return (
                    <div key={source} className="biz-card" style={{ position: 'relative', backgroundColor: '#f1f5f9' }}>
                      <button onClick={() => toggleBusinessStatus(source)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}>
                        Restore
                      </button>
                      <h6 style={{ fontSize: '14px', fontWeight: 'bold', paddingRight: '50px', color: '#475569', textDecoration: 'line-through' }}>{source}</h6>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#94a3b8' }}>Past Invested: ৳{fixedInvestments[source]}</p>
                      <span style={{ color: bizProfit >= 0 ? '#64748b' : '#ef4444', display: 'block', marginTop: '5px' }}>
                        Net {bizProfit >= 0 ? 'Profit' : 'Loss'}: ৳{Math.abs(bizProfit)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        {activeTab === 'personal' ? (
          <>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Expense Details (e.g. Rent, Food)" required />
            <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" required />
            <input name="date" type="date" value={formData.date} onChange={handleChange} required />
          </>
        ) : (
          <>
            {bizRecordType !== 'Expense' && (
              <select name="source" value={formData.source} onChange={handleChange} style={{ backgroundColor: '#eef2ff', fontWeight: '500' }}>
                {activeBizList.map(biz => (
                  <option key={biz} value={biz}>{biz}</option>
                ))}
              </select>
            )}

            {bizRecordType === 'Expense' && (
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Expense kothay hoise? (e.g. Tour, Bus vara)"
                required
              />
            )}

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <select value={bizRecordType} onChange={(e) => setBizRecordType(e.target.value)} style={{ flex: '1' }}>
                <option value="Profit">Profit (+)</option>
                <option value="Loss">Loss (-)</option>
                <option value="Expense">Expense (-)</option>
              </select>
              <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" required style={{ flex: '2' }} />
            </div>

            <input name="date" type="date" value={formData.date} onChange={handleChange} required />
          </>
        )}
        <button type="submit">{activeTab === 'business' ? 'Add Record' : 'Add Expense'}</button>
      </form>

      <div className="list">
        <h3>History ({activeTab === 'personal' ? 'Personal' : 'Business'})</h3>
        {displayTransactions.map(t => (
          <div key={t.id} className="item">
            <div className="item-info">
              <strong>{t.title}</strong>
              <small>
                {formatDate(t.date)}
                {t.source === GENERAL_EXPENSE ? ' • General Expense' : ''}
              </small>
            </div>
            <div className="item-amount" style={{ color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
              {t.type === 'income' ? '+' : '-'} ৳{Number(t.amount)}
            </div>
            <button onClick={() => handleDelete(t.id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App