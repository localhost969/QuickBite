import { useState, useEffect } from 'react';
import { FaWallet, FaMoneyBillWave, FaHistory, FaTicketAlt, FaShoppingCart, FaPlus, FaMinus, FaExpand, FaCompress } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user', {
        headers: {
          Authorization: token || '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.wallet_balance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/wallet/transactions', {
        headers: {
          Authorization: token || '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode) {
      toast.error('Please enter a voucher code');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        return;
      }

      const response = await fetch('https://localhost969.pythonanywhere.com/wallet/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ 
          voucher_code: voucherCode,
          user_email: userEmail
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Voucher redeemed successfully!');
        setVoucherCode('');
        fetchWalletData();
        fetchTransactions();
      } else {
        toast.error(data.message || 'Failed to redeem voucher');
      }
    } catch (error) {
      toast.error('Error redeeming voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    switch (type) {
      case 'WELCOME_BONUS':
      case 'COUPON':
        return 'text-emerald-600';
      case 'REFUND':
        return 'text-blue-600';
      case 'ORDER':
        return amount < 0 ? 'text-red-600' : 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case 'WELCOME_BONUS':
        return <FaWallet className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600`} />;
      case 'COUPON':
        return <FaTicketAlt className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600`} />;
      case 'REFUND':
        return <FaPlus className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />;
      case 'ORDER':
        return amount < 0 ? 
          <FaMinus className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-red-600`} /> :
          <FaPlus className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600`} />;
      default:
        return <FaHistory className={`${isCompactView ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />;
    }
  };

  const getTransactionBackground = (type: string) => {
    switch (type) {
      case 'WELCOME_BONUS':
      case 'COUPON':
        return 'bg-emerald-50 border-emerald-100';
      case 'REFUND':
        return 'bg-blue-50 border-blue-100';
      case 'ORDER':
        return 'bg-gray-50 border-gray-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isCompactView) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600 mt-1">Manage your balance and transactions</p>
            </div>
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isCompactView ? <FaExpand className="w-4 h-4" /> : <FaCompress className="w-4 h-4" />}
              {isCompactView ? 'Expanded View' : 'Compact View'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance Card */}
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <FaWallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-primary-100 text-sm font-medium">Available Balance</p>
                      <h2 className="text-4xl font-bold">₹{balance.toFixed(2)}</h2>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
                    <span className="text-primary-100 text-sm">Last updated: {new Date().toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 text-primary-100 text-sm">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Active
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Transaction History */}
              <motion.div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                    <span className="text-sm text-gray-500">{transactions.length} transactions</span>
                  </div>
                </div>
                
                <div className={`${isCompactView ? 'max-h-96 overflow-y-auto' : ''}`}>
                  {transactions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {transactions.map((transaction: any, index: number) => (
                        <motion.div
                          key={transaction.id}
                          className={`${isCompactView ? 'px-4 py-3' : 'px-6 py-4'} hover:bg-gray-50 transition-colors`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`${isCompactView ? 'p-2' : 'p-3'} bg-gray-100 rounded-xl`}>
                                {getTransactionIcon(transaction.type, transaction.amount)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`${isCompactView ? 'text-sm' : 'text-base'} font-medium text-gray-900 truncate`}>
                                  {transaction.description}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-500`}>
                                    {formatDate(transaction.timestamp)}
                                  </span>
                                  {transaction.status && (
                                    <span className={`${isCompactView ? 'text-xs px-2 py-0.5' : 'text-sm px-2 py-1'} rounded-full font-medium ${
                                      transaction.status === 'completed' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {transaction.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`${isCompactView ? 'text-lg' : 'text-xl'} font-bold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                                {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <FaHistory className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                      <p className="text-gray-500 text-center">Your transaction history will appear here once you start using your wallet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Voucher Redemption */}
              <motion.div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <FaTicketAlt className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Redeem Voucher</h3>
                    <p className="text-sm text-gray-600">Enter your voucher code</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Enter voucher code"
                      className="w-full p-4 text-lg font-mono uppercase border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      maxLength={12}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaTicketAlt className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRedeemVoucher}
                    disabled={isLoading || !voucherCode}
                    className="w-full py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Redeeming...
                      </div>
                    ) : (
                      'Redeem Voucher'
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-semibold text-gray-900">{transactions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">
                      {transactions.filter(t => new Date(t.timestamp).getMonth() === new Date().getMonth()).length}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current Balance</span>
                      <span className="font-bold text-primary-600">₹{balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
