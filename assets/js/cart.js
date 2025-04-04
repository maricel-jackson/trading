let cart = [];

document.addEventListener('DOMContentLoaded', function () {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartIcon = document.getElementById('cart-icon');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.querySelector('.cart-close'); // Update selector
    const checkoutBtn = document.getElementById('checkout-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const quantity = parseInt(document.getElementById(`${productId}-quantity`).value);

            addToCart(productId, productName, price, quantity);
            updateCartDisplay();
        });
    });

    cartIcon.addEventListener('click', () => {
        cartOverlay.style.display = 'block';
        // Force reflow
        cartOverlay.offsetHeight;
        cartOverlay.classList.add('show');
    });

    // Update the close cart event listener
    closeCartBtn.addEventListener('click', () => {
        const cartOverlay = document.getElementById('cart-overlay');
        cartOverlay.classList.remove('show');
        setTimeout(() => {
            cartOverlay.style.display = 'none';
        }, 300);
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        generateReceipt();
        alert('Thank you for your order!');
        cart = [];
        updateCartDisplay();

        // Smooth exit for cart overlay
        cartOverlay.classList.remove('show');
        setTimeout(() => {
            cartOverlay.style.display = 'none';
        }, 300);
    });

    initModalHandling();
});

function addToCart(id, name, price, quantity) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }

    // Show notification
    const notification = document.getElementById('notification');
    notification.classList.add('show');

    // Hide notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>$${(item.price * item.quantity).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}</p>
                </div>
                <button class="remove-item" data-index="${index}">×</button>
            </div>
        `;
    });

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartTotal.textContent = total.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Initialize modal handling for product images
// This function sets up the modal handling for product images
// It adds event listeners to the triggers and close buttons, and handles the opening and closing of modals
// It also ensures that the modals are displayed with a fade-in effect  

function initModalHandling() {
    const triggers = document.querySelectorAll('.zoom-trigger');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product');
            const modal = document.getElementById(productId + 'Modal');

            // First display the modal with opacity 0
            modal.style.display = 'flex';

            // Force reflow
            modal.offsetHeight;

            // Add show class for transition
            modal.classList.add('show');
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal.call(this);
            }
        });
    });
}

function closeModal() {
    const modal = this.closest('.modal');
    modal.classList.remove('show');

    // Wait for transition to complete before hiding
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match this with CSS transition duration
}

// Function to generate the receipt PDF
function generateReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add receipt header
    doc.setFontSize(20);
    doc.text('Jackmar Trading', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Order Receipt', 105, 30, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

    // Prepare table data
    const tableColumn = ['Item', 'Quantity', 'Price', 'Total'];
    const tableRows = [];
    let grandTotal = 0;

    cart.forEach(item => {
        const total = item.price * item.quantity;
        grandTotal += total;
        tableRows.push([
            item.name,
            item.quantity,
            `$${item.price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `$${total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        ]);
    });

    // Add items table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [245, 164, 37],
            textColor: [255, 255, 255]
        },
        styles: {
            halign: 'center'
        }
    });

    // Add total
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.text(`Grand Total: $${grandTotal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, 105, finalY + 20, { align: 'center' });

    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, finalY + 30, { align: 'center' });
    doc.text('For any inquiries, please contact support@jackmartrading.com', 105, finalY + 35, { align: 'center' });

    // Save the PDF
    doc.save(`JackmarTrading_Receipt_${new Date().toISOString().slice(0, 10)}.pdf`);
}

