// Update API URL configuration
       const API_URL = 'http://localhost969.pythonanywhere.com/';
       let cart = [];
       let walletBalance = 50.00;

       // Add global variable to fix isProcessingOrder error
       let isProcessingOrder = false;

       // Add delivery locations constant
       const DELIVERY_LOCATIONS = {
           'PICKUP': { charge: 0, label: 'Canteen Pickup' },
           'CLASS': { charge: 20, label: 'Classroom Delivery' }
       };

       // Enhanced updateTotal function
       function updateTotal() {
           const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
           const deliveryOption = document.querySelector('input[name="delivery"]:checked')?.value;
           const deliveryCharge = deliveryOption === 'CLASS' ? DELIVERY_LOCATIONS.CLASS.charge : 0;
           const total = subtotal + deliveryCharge;

           document.getElementById('cartSubtotal').textContent = subtotal.toFixed(2);
           document.getElementById('deliveryCharge').textContent = deliveryCharge.toFixed(2);
           document.getElementById('cartTotal').textContent = total.toFixed(2);

           // Toggle classroom details visibility
           const classroomDetails = document.getElementById('classroomDetails');
           if (classroomDetails) {
               classroomDetails.style.display = deliveryOption === 'CLASS' ? 'block' : 'none';
           }
       }

       // Fix addToCart to properly preserve image_url
       function addToCart(product) {
           console.log('Adding product to cart:', product); // Debug log
           
           const cartItem = {
               id: product.id,
               name: product.name,
               price: product.price,
               quantity: 1,
               // Robust image handling - store both image fields
               image_url: product.image_url || product.image || 'https://placehold.co/60x60?text=No+Image',
               image: product.image
           };

           const existingItem = cart.find(item => item.id === product.id);
           if (existingItem) {
               existingItem.quantity++;
           } else {
               console.log('New item added to cart with image:', cartItem.image_url); // Debug log
               cart.push(cartItem);
           }
           
           updateCartUI();
           updateTotal();
           showToast('success', `Added ${product.name} to cart`);
           animateCartIcon();
       }

       // Fixed updateCartUI function with improved image handling
       function updateCartUI() {
           const cartItems = document.getElementById('cartItems');
           
           // Check if cartItems exists before operating on it
           if (!cartItems) {
               console.error('Cart items container not found in the DOM');
               return;
           }
           
           // Find or create the cart count element
           let cartCount = document.querySelector('.cart-count');
           if (!cartCount) {
               console.warn('Cart count element not found, trying to find cart icon');
               const cartIcon = document.querySelector('.cart-icon');
               if (cartIcon) {
                   // Check if there's an existing span we can use
                   cartCount = cartIcon.querySelector('span');
                   if (!cartCount) {
                       // Create a new span element with the cart-count class if none exists
                       cartCount = document.createElement('span');
                       cartCount.className = 'cart-count';
                       cartIcon.appendChild(cartCount);
                       console.log('Created new cart-count element');
                   } else {
                       // Add the cart-count class to the existing span if it doesn't have it
                       if (!cartCount.classList.contains('cart-count')) {
                           cartCount.classList.add('cart-count');
                       }
                   }
               } else {
                   console.error('Cart icon element not found');
               }
           }
       
           if (!cart.length) {
               cartItems.innerHTML = `
                   <div class="empty-cart">
                       <i class="fas fa-shopping-basket"></i>
                       <p>Your cart is empty</p>
                       <div class="suggestion">Add items from the menu to get started</div>
                   </div>
               `;
               
               // Hide delivery section and adjust spacing when cart is empty
               const deliverySection = document.querySelector('.delivery-section');
               if (deliverySection) {
                   deliverySection.style.display = 'none';
               }
           } else {
               // Show delivery section when cart has items
               const deliverySection = document.querySelector('.delivery-section');
               if (deliverySection) {
                   deliverySection.style.display = 'block';
               }
               
               // Debug log for cart contents
               console.log('Current cart contents:', JSON.stringify(cart));
               
               // Render cart items with robust image handling
               cartItems.innerHTML = cart.map((item, index) => {
                   // Robust image fallback chain
                   const imageUrl = item.image_url || item.image || 'https://placehold.co/60x60?text=No+Image';
                   
                   // Debug image URL
                   console.log(`Item ${item.name} image URL:`, imageUrl);
                   
                   return `
                       <div class="cart-item" style="animation-delay: ${index * 0.05}s">
                           <div class="cart-item-image-container">
                               <img src="${imageUrl}" 
                                    alt="${item.name}" 
                                    class="cart-item-image" 
                                    onerror="this.onerror=null; this.src='https://placehold.co/60x60?text=No+Image'; console.log('Image fallback used for ${item.name}');">
                           </div>
                           <div class="cart-item-details">
                               <span class="cart-item-name">${item.name}</span>
                               <div class="cart-item-controls">
                                   <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                                   <span class="cart-item-quantity">${item.quantity}</span>
                                   <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                               </div>
                           </div>
                           <div class="cart-item-price-group">
                               <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                               <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                                   <i class="fas fa-trash-alt"></i>
                               </button>
                           </div>
                       </div>
                   `;
               }).join('');
           }
       
           // Update cart count with animation - with null check
           if (cartCount) {
               const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
               if (totalItems > 0) {
                   cartCount.textContent = totalItems;
                   cartCount.style.display = 'inline-flex';
                   cartCount.classList.add('bounce');
                   setTimeout(() => {
                       if (cartCount) cartCount.classList.remove('bounce');
                   }, 300);
               } else {
                   cartCount.textContent = '0';
                   cartCount.style.display = 'none';
               }
           } else {
               console.warn('Cart count element not found');
           }
           
           // Add null check before calling updateTotal
           if (typeof updateTotal === 'function') {
               updateTotal();
           } else {
               console.error('updateTotal function is not defined');
           }

           // Force layout recalculation to ensure proper scroll height
           setTimeout(() => {
               const cartItemsContainer = document.getElementById('cartItems');
               if (cartItemsContainer) {
                   cartItemsContainer.style.display = 'none';
                   void cartItemsContainer.offsetHeight; // Force reflow
                   cartItemsContainer.style.display = '';
               }
           }, 0);
       }

       // Enhanced removeFromCart with animation
       function removeFromCart(productId) {
           const itemIndex = cart.findIndex(item => item.id === productId);
           if (itemIndex > -1) {
               const cartItems = document.querySelectorAll('.cart-item');
               const cartItem = cartItems[itemIndex];
               
               // Add null check before animating
               if (cartItem) {
                   // Animate item removal
                   cartItem.style.animation = 'slideOutRight 0.3s ease forwards';
                   
                   setTimeout(() => {
                       cart = cart.filter(item => item.id !== productId);
                       updateCartUI();
                   }, 300);
               } else {
                   // Just remove the item without animation if element not found
                   cart = cart.filter(item => item.id !== productId);
                   updateCartUI();
               }
           }
       }

       // Enhanced checkout function
       async function checkout() {
           if (isProcessingOrder) return;
           isProcessingOrder = true;

           try {
               const checkoutBtn = document.querySelector('.checkout-btn');
               checkoutBtn.disabled = true;
               checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

               if (!cart.length) {
                   throw new Error('Your cart is empty');
               }

               const deliveryOption = document.querySelector('input[name="delivery"]:checked')?.value;
               if (!deliveryOption) {
                   throw new Error('Please select a delivery option');
               }

               const token = localStorage.getItem('token');
               if (!token) {
                   throw new Error('Please log in to place order');
               }

               const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
               const deliveryCharge = deliveryOption === 'CLASS' ? DELIVERY_LOCATIONS.CLASS.charge : 0;
               const total = subtotal + deliveryCharge;

               if (total > walletBalance) {
                   throw new Error('Insufficient balance! Please add money to your wallet.');
               }

               let deliveryDetails = {};
               if (deliveryOption === 'CLASS') {
                   const classroom = document.getElementById('classroom').value.trim();
                   const deliveryTime = document.getElementById('deliveryTime').value;
                   
                   if (!classroom) {
                       throw new Error('Please enter your classroom location');
                   }
                   if (classroom.length > 30) {  // Allow any text but limit length
                       throw new Error('Classroom location is too long');
                   }
                   if (!deliveryTime) {
                       throw new Error('Please select a delivery time');
                   }

                   deliveryDetails = { classroom, delivery_time: deliveryTime };
               }

               // Use the email from the user details API
               const userEmail = localStorage.getItem('userEmail');
               if (!userEmail) {
                   throw new Error('User email not found');
               }

               const orderData = {
                   user_email: userEmail,
                   items: cart.map(item => ({
                       id: item.id,
                       name: item.name,
                       price: item.price,
                       quantity: item.quantity,
                       image_url: item.image_url
                   })),
                   delivery_option: deliveryOption,
                   ...deliveryDetails,
                   subtotal,
                   delivery_charge: deliveryCharge,
                   total
               };

               const response = await fetch(`${API_URL}/orders`, {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': token
                   },
                   body: JSON.stringify(orderData)
               });

               const data = await response.json();
               if (!response.ok) {
                   throw new Error(data.error || 'Failed to place order');
               }

               // Success handling
               walletBalance -= total;
               document.getElementById('walletAmount').textContent = walletBalance.toFixed(2);
               
               // Animate cart emptying
               const cartItems = document.querySelectorAll('.cart-item');
               cartItems.forEach((item, index) => {
                   setTimeout(() => {
                       item.style.animation = 'slideOutRight 0.3s ease forwards';
                   }, index * 100);
               });

               setTimeout(() => {
                   cart = [];
                   updateCartUI();
                   toggleCart();
                   showToast('success', 'Order placed successfully!');
                   fetchUserOrders();
               }, cartItems.length * 100 + 300);

           } catch (error) {
               showToast('error', error.message);
           } finally {
               isProcessingOrder = false;
               const checkoutBtn = document.querySelector('.checkout-btn');
               checkoutBtn.disabled = false;
               checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
           }
       }

       // Initialize everything when the page loads
       document.addEventListener('DOMContentLoaded', async () => {
           const token = localStorage.getItem('token');
           if (!token) {
               window.location.href = 'https://localhost969.github.io/QuickBite/login.html';
               return;
           }
           
           await Promise.all([
               fetchUserDetails(),
               fetchProducts()
           ]);

           // Add event listeners for delivery options
           document.querySelectorAll('input[name="delivery"]').forEach(radio => {
               radio.addEventListener('change', (e) => {
                   updateTotal();
                   const deliveryDetails = document.getElementById('deliveryDetails');
                   if (e.target.value === 'CLASS') {
                       deliveryDetails.innerHTML = `
                           <div class="delivery-detail-group">
                               <input type="text" id="classroom" 
                                      placeholder="Enter classroom location (e.g., CS Block 301, Library)" 
                                      class="form-control">
                               <select id="deliveryTime" class="form-control">
                                   <option value="">Select delivery time</option>
                                   <option value="before_lunch">Before Lunch Break (11:30 AM)</option>
                                   <option value="during_lunch">During Lunch Break (1:00 PM)</option>
                                   <option value="after_lunch">After Lunch Break (2:30 PM)</option>
                               </select>
                           </div>
                       `;
                   } else {
                       deliveryDetails.innerHTML = '';
                   }
               });
           });

           // Add text/icon to logout button and cart icon
           document.querySelector('.cart-icon').innerHTML = '<i class="fas fa-shopping-cart"></i>';
           document.querySelector('[onclick="logout()"]').textContent = 'Logout';

           // Make sure cart-icon and cart-count exist
           const cartIcon = document.querySelector('.cart-icon');
           if (cartIcon) {
               // Ensure the cart-icon has the shopping cart icon and cart-count span
               cartIcon.innerHTML = `
                   <i class="fas fa-shopping-cart"></i>
                   <span class="cart-count" style="display: none;">0</span>
               `;
           }
       });

       async function fetchUserDetails() {
   const token = localStorage.getItem('token');
   try {
       const response = await fetch(`${API_URL}/user`, {
           headers: {
               'Authorization': token,
               'Accept': 'application/json'
           }
       });
       const data = await response.json();
       if (response.ok) {
           // First check if elements exist before updating them
           const userGreeting = document.getElementById('userGreeting');
           const welcomeMessage = document.getElementById('welcomeMessage');
           const walletDisplay = document.getElementById('walletAmount');
           
           if (!userGreeting || !welcomeMessage || !walletDisplay) {
               console.error('Required DOM elements not found');
               return null;
           }

           const userName = data.name || 'User';
           userGreeting.textContent = `Welcome back, ${userName}!`;
           welcomeMessage.textContent = userName;
           
           // Update wallet balance with animation
           const currentBalance = parseFloat(walletDisplay.textContent) || 0;
           const newBalance = parseFloat(data.wallet_balance) || 0;
           
           // Update global wallet balance
           walletBalance = newBalance;
           
           // Animate the balance change
           if (currentBalance !== newBalance) {
               animateNumber(currentBalance, newBalance, (value) => {
                   walletDisplay.textContent = value.toFixed(2);
               });
           } else {
               walletDisplay.textContent = newBalance.toFixed(2);
           }

           // Store user email in localStorage
           localStorage.setItem('userEmail', data.email);
           
           // Log successful update
           console.log('User details updated successfully:', {
               userName,
               currentBalance,
               newBalance,
               walletBalance
           });
           
           return data;
       } else {
           throw new Error(data.error || 'Failed to fetch user details');
       }
   } catch (error) {
       console.error('Error fetching user details:', error);
       showToast('error', 'Failed to load user details');
       return null;
   }
}

       // Add number animation function
       function animateNumber(start, end, callback) {
           const duration = 1000;
           const startTime = performance.now();
           
           function update(currentTime) {
               const elapsed = currentTime - startTime;
               const progress = Math.min(elapsed / duration, 1);
               
               const value = start + (end - start) * progress;
               callback(value);
               
               if (progress < 1) {
                   requestAnimationFrame(update);
               }
           }
           
           requestAnimationFrame(update);
       }

       async function fetchProducts() {
           try {
               // Updated endpoint to match backend
               const response = await fetch(`${API_URL}/get-products`);
               const data = await response.json();
               if (Array.isArray(data)) { // Backend returns array directly
                   displayProducts(data);
               } else {
                   console.error('Unexpected data format:', data);
               }
           } catch (error) {
               console.error('Error fetching products:', error);
           }
       }

       function displayProducts(products) {
           const grid = document.getElementById('menuGrid');
           grid.innerHTML = products.map((product, index) => {
               const isAvailable = (product.availability || '').toLowerCase() === 'available';
               const imageUrl = product.image_url || product.image;

               return `
                   <div class="food-card ${!isAvailable ? 'unavailable' : ''}" 
                        data-category="${product.category || 'all'}"
                        data-availability="${isAvailable ? 'available' : 'unavailable'}"
                        data-id="${product.id}"
                        style="--animation-order: ${index}">
                       <div class="food-image-container">
                           <img src="${imageUrl}" 
                                alt="${product.name}" 
                                class="food-image" 
                                onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                       </div>
                       <div class="food-details">
                           <div>
                               <h3 class="food-title">${product.name}</h3>
                               <p class="food-price">₹${product.price.toFixed(2)}</p>
                           </div>
                           ${window.innerWidth <= 768 ? `
                               ${isAvailable ? `
                                   <button class="quick-add" onclick='addToCart(${JSON.stringify(product)})'>
                                       <i class="fas fa-plus"></i>
                                   </button>
                               ` : `
                                   <div class="sold-out-ribbon">Sold Out</div>
                               `}
                           ` : `
                               <button class="add-to-cart-btn" ${!isAvailable ? 'disabled' : ''}
                                       onclick='${isAvailable ? `addToCart(${JSON.stringify(product)})` : ""}'>
                                   <i class="fas fa-${isAvailable ? 'plus' : 'ban'}"></i>
                                   ${isAvailable ? 'Add to Cart' : 'Out of Stock'}
                               </button>
                           `}
                       </div>
                       ${!isAvailable ? `
                           <div class="status-overlay">
                               <div class="status-message">${product.name} is currently unavailable</div>
                               <div class="restock-info">Expected to restock soon</div>
                           </div>
                       ` : ''}
                   </div>
               `;
           }).join('');

           // Update filter counts
           updateFilterCounts(products);
       }

       // Add new function to update filter counts
       function updateFilterCounts(products) {
           const categories = {};
           let availableCount = 0;

           products.forEach(product => {
               // Count by category
               const category = product.category || 'uncategorized';
               categories[category] = (categories[category] || 0) + 1;

               // Count available items
               if ((product.availability || '').toLowerCase() === 'available') {
                   availableCount++;
               }
           });

           // Update category filter buttons with counts
           document.querySelectorAll('[data-filter="category"]').forEach(btn => {
               const category = btn.dataset.value;
               const count = category === 'all' ? products.length : (categories[category] || 0);
               btn.innerHTML = `${btn.textContent.split('(')[0]} (${count})`;
           });

           // Update availability filter button with count
           const availableBtn = document.querySelector('[data-filter="availability"][data-value="available"]');
           if (availableBtn) {
               availableBtn.innerHTML = `Available (${availableCount})`;
           }
       }

       function removeFromCart(productId) {
           cart = cart.filter(item => item.id !== productId);
           updateCartUI();
       }

       function updateQuantity(productId, change) {
           const item = cart.find(item => item.id === productId);
           if (item) {
               const newQuantity = item.quantity + change;
               if (newQuantity > 0) {
                   item.quantity = newQuantity;
               } else {
                   removeFromCart(productId);
                   return;
               }
               updateCartUI();
           }
       }

       // Enhanced toggleCart function
       function toggleCart() {
           const sidebar = document.getElementById('cartSidebar');
           const isVisible = sidebar.classList.contains('show');
           
           if (!isVisible) {
               sidebar.style.display = 'flex';
               requestAnimationFrame(() => {
                   sidebar.classList.add('show');
               });
           } else {
               sidebar.classList.remove('show');
               setTimeout(() => {
                   sidebar.style.display = 'none';
               }, 300);
           }
       }

       async function fetchUserOrders() {
           try {
               const token = localStorage.getItem('token');
               const email = localStorage.getItem('userEmail');
               if (!email) {
                   console.error('No user email found');
                   return;
               }

               const response = await fetch(`${API_URL}/orders/user/${encodeURIComponent(email)}`, {
                   headers: {
                       'Authorization': token,
                       'Accept': 'application/json'
                   }
               });

               if (!response.ok) {
                   throw new Error(`HTTP error! status: ${response.status}`);
               }
               
               const data = await response.json();
               console.log('Orders data:', data); // Debug log
               
               if (data.success && Array.isArray(data.orders)) {
                   displayUserOrders(data.orders);
               } else {
                   throw new Error(data.error || 'Failed to fetch orders');
               }
           } catch (error) {
               console.error('Error fetching orders:', error);
               showToast('error', 'Failed to load orders');
           }
       }

       function displayUserOrders(orders) {
           console.log('Displaying orders:', orders);
           const yetToBeDeliveredContainer = document.getElementById('yetToBeDeliveredOrders');
           const deliveredContainer = document.getElementById('deliveredOrders');

           if (!orders || orders.length === 0) {
               const emptyState = `
                   <div class="no-orders">
                       <i class="fas fa-receipt"></i>
                       <p>No orders yet</p>
                       <div class="suggestion">Your order history will appear here</div>
                   </div>
               `;
               yetToBeDeliveredContainer.innerHTML = emptyState;
               deliveredContainer.innerHTML = emptyState;
               return;
           }

           const activeOrders = orders.filter(order => 
               ['pending', 'accepted', 'ready'].includes(order.status.toLowerCase())
           );
           
           const pastOrders = orders.filter(order => 
               ['completed', 'cancelled'].includes(order.status.toLowerCase())
           );

           console.log('Active orders:', activeOrders);
           console.log('Past orders:', pastOrders);

           const createCard = (order) => {
               const safeOrder = {
                   ...order,
                   items: order.items.map(item => ({
                       ...item,
                       // Use image_url consistently
                       image_url: item.image_url || item.image
                   }))
               };

               return `
                   <div class="order-card" data-order='${JSON.stringify(safeOrder).replace(/'/g, "&#39;")}'>
                       <div class="order-header">
                           <h4>Order #${order.order_id}</h4>
                           <span class="order-status ${order.status.toLowerCase()}">
                               ${order.status.toUpperCase()}
                           </span>
                       </div>
                       <div class="order-content">
                           <div class="order-info">
                               <p><strong>Ordered:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                               <p><strong>Delivery:</strong> ${order.delivery_option}</p>
                               ${order.classroom ? `<p><strong>Classroom:</strong> ${order.classroom}</p>` : ''}
                           </div>
                           <div class="order-items">
                               ${order.items.map(item => `
                                   <div class="order-item">
                                       <img src="${item.image_url || item.image}" alt="${item.name}" 
                                            class="order-item-image"
                                            onerror="this.src='https://placehold.co/60x60?text=No+Image'">
                                       <div class="order-item-details">
                                           <p class="item-name">${item.name}</p>
                                           <p class="item-quantity">Qty: ${item.quantity}</p>
                                       </div>
                                       <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                                   </div>
                               `).join('')}
                           </div>
                       </div>
                       <div class="order-footer">
                           <div class="order-total">
                               <strong>Total:</strong> ₹${order.total.toFixed(2)}
                           </div>
                           <div class="action-buttons">
                               <button class="action-btn view" onclick="viewOrderDetails('${order.order_id}')">
                                   <i class="fas fa-eye"></i> View Details
                               </button>
                               ${order.status.toLowerCase() === 'completed' ? `
                                   <button class="action-btn reorder" onclick="reorderItems('${order.order_id}')">
                                       <i class="fas fa-redo"></i> Reorder
                                   </button>
                               ` : ''}
                           </div>
                       </div>
                   </div>
               `;
           };

           yetToBeDeliveredContainer.innerHTML = activeOrders.length ? 
               activeOrders.map(createCard).join('') :
               `<div class="no-orders">No active orders</div>`;

           deliveredContainer.innerHTML = pastOrders.length ?
               pastOrders.map(createCard).join('') :
               `<div class="no-orders">No past orders</div>`;
       }

       function findOrderById(orderId) {
           const orderCards = document.querySelectorAll('.order-card');
           for (const card of orderCards) {
               try {
                   const orderData = JSON.parse(card.dataset.order);
                   if (orderData.order_id === orderId) {
                       return orderData;
                   }
               } catch (e) {
                   console.error('Error parsing order data:', e);
               }
           }
           return null;
       }

       function showOrderHistory() {
           const historySection = document.getElementById('orderHistorySection');
           const menuSection = document.getElementById('menuSection');
           
           if (menuSection) menuSection.style.display = 'none';
           historySection.style.display = 'block';
           
           fetchUserOrders();
           
           historySection.scrollIntoView({ behavior: 'smooth' });
       }

       function viewOrderDetails(orderId) {
           const order = findOrderById(orderId);
           if (!order) return;
       
           const modal = document.getElementById('orderDetailsModal');
           const content = document.getElementById('orderDetailsContent');
           
           content.innerHTML = `
               <div class="order-details">
                   <h4>Order #${order.order_id}</h4>
                   <div class="order-timeline">
                       ${createOrderTimeline(order)}
                   </div>
                   <div class="order-items">
                       <h4>Items Ordered</h4>
                       ${order.items.map(item => `
                           <div class="order-item">
                               <img src="${item.image_url || item.image}" 
                                    alt="${item.name}" 
                                    class="order-item-image">
                               <div class="order-item-details">
                                   <p class="item-name">${item.name}</p>
                                   <p class="item-quantity">Qty: ${item.quantity} × ₹${item.price}</p>
                               </div>
                               <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                           </div>
                       `).join('')}
                   </div>
                   <div class="order-summary">
                       <div class="summary-row">
                           <span>Subtotal:</span>
                           <span>₹${order.subtotal.toFixed(2)}</span>
                       </div>
                       <div class="summary-row">
                           <span>Delivery Charge:</span>
                           <span>₹${order.delivery_charge.toFixed(2)}</span>
                       </div>
                       <div class="summary-row total">
                           <span>Total:</span>
                           <span>₹${order.total.toFixed(2)}</span>
                       </div>
                   </div>
                   ${order.status === 'pending' ? `
                       <div class="order-actions">
                           <button class="btn btn-danger" onclick="showCancellationOptions('${order.order_id}')">
                               Cancel Order
                           </button>
                       </div>
                   ` : ''}
               </div>
           `;
           
           modal.classList.add('show');
       }

       function createOrderTimeline(order) {
           const steps = [
               { status: 'pending', label: 'Order Placed', time: order.created_at },
               { status: 'accepted', label: 'Accepted', time: order.accepted_at },
               { status: 'ready', label: 'Ready for Pickup', time: order.ready_at },
               { status: 'completed', label: 'Completed', time: order.completed_at }
           ];

           if (order.status === 'cancelled') {
               return `
                   <div class="timeline-item active cancelled">
                       <p class="time">${new Date(order.cancelled_at).toLocaleString()}</p>
                       <p class="label">Order Cancelled</p>
                   </div>
               `;
           }

           return steps.map(step => {
               const isActive = order[`${step.status}_at`] || order.status === step.status;
               return `
                   <div class="timeline-item ${isActive ? 'active' : ''}">
                       <p class="time">${step.time ? new Date(step.time).toLocaleString() : '--'}</p>
                       <p class="label">${step.label}</p>
                   </div>
               `;
           }).join('');
       }

       function showCancellationOptions(orderId) {
           const order = findOrderById(orderId);
           if (!order) return;

           const modal = document.getElementById('confirmationModal');
           const message = document.getElementById('confirmationMessage');
           const confirmBtn = document.getElementById('confirmBtn');
           
           message.innerHTML = `
               <h4>Cancel Order #${order.order_id}?</h4>
               <div class="cancellation-options">
                   <p>Please select a refund option:</p>
                   <label class="refund-option">
                       <input type="radio" name="refundOption" value="full" checked>
                       Full Refund (₹${order.total.toFixed(2)})
                   </label>
                   <label class="refund-option">
                       <input type="radio" name="refundOption" value="partial">
                       Partial Refund (₹${(order.total * 0.8).toFixed(2)}) - 20% cancellation fee
                   </label>
               </div>
           `;
           
           confirmBtn.onclick = () => {
               const refundOption = document.querySelector('input[name="refundOption"]:checked').value;
               cancelOrder(orderId, refundOption);
           };
           
           modal.classList.add('show');
       }

       async function cancelOrder(orderId, refundOption) {
           try {
               const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': localStorage.getItem('token')
                   },
                   body: JSON.stringify({ refund_option: refundOption })
               });

               const data = await response.json();
               if (data.success) {
                   showToast('success', 'Order cancelled successfully');
                   closeConfirmationModal();
                   closeOrderModal();
                   fetchUserOrders();
               } else {
                   throw new Error(data.error);
               }
           } catch (error) {
               showToast('error', error.message);
           }
       }

       function reorderItems(orderId) {
           const order = findOrderById(orderId);
           if (!order) return;

           const modal = document.getElementById('confirmationModal');
           const message = document.getElementById('confirmationMessage');
           const confirmBtn = document.getElementById('confirmBtn');
           
           message.innerHTML = `
               <h4>Reorder these items?</h4>
               <div class="order-items-preview">
                   ${order.items.map(item => `
                       <div class="order-item-mini">
                           <span>${item.quantity}x ${item.name}</span>
                           <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                   `).join('')}
                   <div class="total-preview">
                       <strong>Total: ₹${order.total.toFixed(2)}</strong>
                   </div>
               </div>
           `;
           
           confirmBtn.onclick = () => {
               // Ensure image_url is preserved when reordering
               cart = order.items.map(item => ({
                   ...item,
                   image_url: item.image_url || item.image
               }));
               updateCartUI();
               toggleCart();
               closeConfirmationModal();
               showToast('success', 'Items added to cart');
           };
           
           modal.classList.add('show');
       }

       function closeOrderModal() {
           document.getElementById('orderDetailsModal').classList.remove('show');
       }

       function closeConfirmationModal() {
           document.getElementById('confirmationModal').classList.remove('show');
       }

       function toggleSection(section) {
           const menuSection = document.getElementById('menuSection');
           const historySection = document.getElementById('orderHistorySection');
           
           if (section === 'menu') {
               menuSection.style.display = 'none';
               historySection.style.display = 'block';
               fetchUserOrders();
           }
       }

       // Update toast notification function
       function showToast(type, message) {
           const toast = document.getElementById('toast');
           toast.className = `toast ${type}`;
           toast.innerHTML = `
               <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
               <span id="toastMessage">${message}</span>
           `;
           toast.classList.add('show');
           setTimeout(() => toast.classList.remove('show'), 3000);
       }

       // Add cart icon animation
       function animateCartIcon() {
           const cartIcon = document.querySelector('.cart-icon');
           cartIcon.style.animation = 'bounce 0.5s ease';
           setTimeout(() => cartIcon.style.animation = '', 500);
       }

       // Enhanced fetchUserDetails function
       async function fetchUserDetails() {
           try {
               const token = localStorage.getItem('token');
               const response = await fetch(`${API_URL}/user`, {
                   headers: {
                       'Authorization': token,
                       'Accept': 'application/json'
                   }
               });
               const data = await response.json();
               
               if (response.ok) {
                   const userName = data.name || 'User';
                   document.getElementById('userGreeting').textContent = `Welcome back, ${userName}!`;
                   document.getElementById('welcomeMessage').textContent = userName;
                   
                   // Update wallet balance with animation
                   const walletDisplay = document.getElementById('walletAmount');
                   const currentBalance = parseFloat(walletDisplay.textContent);
                   const newBalance = data.wallet_balance;
                   
                   animateNumber(currentBalance, newBalance, (value) => {
                       walletDisplay.textContent = value.toFixed(2);
                   });
                   
                   walletBalance = data.wallet_balance;
               } else {
                   throw new Error(data.error || 'Failed to fetch user details');
               }
           } catch (error) {
               console.error('Error fetching user details:', error);
               showToast('error', 'Failed to load user details');
           }
       }

       // Add number animation function
       function animateNumber(start, end, callback) {
           const duration = 1000;
           const startTime = performance.now();
           
           function update(currentTime) {
               const elapsed = currentTime - startTime;
               const progress = Math.min(elapsed / duration, 1);
               
               const value = start + (end - start) * progress;
               callback(value);
               
               if (progress < 1) {
                   requestAnimationFrame(update);
               }
           }
           
           requestAnimationFrame(update);
       }

       function toggleView(view) {
   const menuSection = document.getElementById('menuSection');
   const historySection = document.getElementById('orderHistorySection');
   const buttons = document.querySelectorAll('.btn-toggle');

   buttons.forEach(btn => {
       btn.classList.toggle('active', btn.dataset.view === view);
   });

   if (view === 'menu') {
       menuSection.style.display = 'block';
       historySection.style.display = 'none';
   } else {
       menuSection.style.display = 'none';
       historySection.style.display = 'block';
       fetchUserOrders();
   }
}

// Add this logout function to your existing JavaScript file
function logout() {
    // Clear all authentication related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    
    // Show logout notification
    showToast('success', 'Logged out successfully');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'https://localhost969.github.io/QuickBite/login.html';
    }, 1000);
}