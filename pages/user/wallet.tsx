import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/userApi';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, Loader } from 'lucide-react';

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== 'user') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch wallet data
  useEffect(() => {
    if (!token) return;

    const fetchWallet = async () => {
      try {
        const walletData = await userApi.wallet.get(token);
        if (walletData.success) {
          setWallet({
            balance: walletData.wallet_balance || 0,
            transactions: walletData.transactions || [],
          });
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token]);

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0 || !token) {
      setErrorMessage('Please enter a valid amount');
      setShowErrorModal(true);
      return;
    }

    setTopUpLoading(true);
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await userApi.wallet.createOrder(token, {
        amount: parseFloat(topUpAmount),
      });

      if (!orderResponse.success || !orderResponse.order) {
        setErrorMessage('Failed to create payment order');
        setShowErrorModal(true);
        setTopUpLoading(false);
        return;
      }

      const options = {
        key: orderResponse.key_id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'Qb Canteen',
        description: 'Wallet Top-up',
        order_id: orderResponse.order.id,
        handler: async (response: any) => {
          // Step 2: Verify payment on backend
          try {
            const verifyResponse = await fetch('/api/user/wallet', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: parseFloat(topUpAmount),
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setWallet((prev) =>
                prev
                  ? {
                      ...prev,
                      balance: verifyData.wallet_balance,
                      transactions: [
                        {
                          id: Date.now().toString(),
                          type: 'credit',
                          amount: parseFloat(topUpAmount),
                          description: 'Wallet Top-up',
                          created_at: new Date().toISOString(),
                        },
                        ...prev.transactions,
                      ],
                    }
                  : null
              );
              setTopUpAmount('');
              setShowTopUpModal(false);
              setSuccessMessage(`₹${parseFloat(topUpAmount).toFixed(2)} has been successfully added to your wallet!`);
              setShowSuccessModal(true);
            } else {
              setErrorMessage('Payment verification failed');
              setShowErrorModal(true);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setErrorMessage('Failed to verify payment');
            setShowErrorModal(true);
          } finally {
            setTopUpLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone_number || '',
        },
        theme: {
          color: '#0040ffea',
        },
        modal: {
          ondismiss: () => {
            setErrorMessage('Payment cancelled. Please try again.');
            setShowErrorModal(true);
            setTopUpLoading(false);
          },
        },
      };

      const razorpayWindow = (window as any).Razorpay;
      if (razorpayWindow) {
        const rzp = new razorpayWindow(options);
        rzp.on('payment.failed', (response: any) => {
          setErrorMessage(`Payment failed: ${response.error.description}`);
          setShowErrorModal(true);
          setTopUpLoading(false);
        });
        rzp.open();
      } else {
        setErrorMessage('Razorpay is not available');
        setShowErrorModal(true);
        setTopUpLoading(false);
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      setErrorMessage('Failed to initiate payment. Please try again.');
      setShowErrorModal(true);
      setTopUpLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/user/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-black">My Wallet</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#0040ffea' }} />
          </div>
        ) : wallet ? (
          <div className="space-y-8">
            {/* Wallet Balance Card */}
            <div className="relative rounded-2xl p-8 text-white overflow-hidden"
              style={{ backgroundColor: '#0040ffea' }}>
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16" />

              {/* Content */}
              <div className="relative z-10">
                <p className="text-blue-100 mb-2">Total Balance</p>
                <h2 className="text-5xl font-bold mb-8 text-white">₹{wallet.balance.toFixed(2)}</h2>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#0040ffea] rounded-lg font-semibold hover:shadow-md transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Money
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-black mb-6">Transaction History</h3>

              {wallet.transactions && wallet.transactions.length > 0 ? (
                <div className="space-y-4">
                  {wallet.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: transaction.type === 'credit' ? '#e8f5e9' : '#ffebee',
                          }}
                        >
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="w-6 h-6" style={{ color: '#4caf50' }} />
                          ) : (
                            <ArrowUpRight className="w-6 h-6" style={{ color: '#f44336' }} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-black">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <span
                        className="font-semibold text-lg"
                        style={{
                          color: transaction.type === 'credit' ? '#4caf50' : '#f44336',
                        }}
                      >
                        {transaction.type === 'credit' ? '+' : '−'}₹{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No transactions yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load wallet data</p>
          </div>
        )}
      </main>

      <Footer />

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10"
          onClick={() => setShowTopUpModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-black mb-6">Add Money to Wallet</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0040ffea] transition-colors"
                min="1"
                step="10"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[100, 250, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="py-2 px-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-200 text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                className="flex-1 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: '#0040ffea' }}
              >
                {topUpLoading ? 'Processing...' : 'Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">Payment Failed</h3>
            <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
              className="w-full py-3 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#0040ffea' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">Payment Successful</h3>
            <p className="text-gray-600 text-center mb-6">{successMessage}</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessMessage('');
              }}
              className="w-full py-3 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#0040ffea' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
