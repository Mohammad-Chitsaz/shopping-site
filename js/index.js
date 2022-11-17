import { productsData } from './products.js';

const cartBtn = document.querySelector('.nav__cart-icon');
const cartModal = document.querySelector('.cart');
const header = document.querySelector('header');
const main = document.querySelector('main');
const cartConfirmBtn = document.querySelector('.cart-confirm');
const cartBackBtn = document.querySelector('.back');
const productsDOM = document.querySelector('.products-center');
const cartTotalItems = document.querySelector('.cart-items');
const cartTotalPrice = document.querySelector('.cart__total-price');
const cartContent = document.querySelector('.cart__content');
const clearCartItemsBtn = document.querySelector('.clear-cart');
let buttonsDOM = [];
let cart = [];

class Products {
  getProducts() {
    return productsData;
  }
}

class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      const productPrice = new Intl.NumberFormat('fa-IR').format(product.price);
      result += `
      <div class="product">
            <div class="img-container">
              <img
                class="product__img"
                src=${product.imageUrl}
                alt=${product.alt}
              />
            </div>
            <div class="product__desc">
              <p class="product__title">${product.title}</p>
              <p class="product__price">${productPrice} تومان</p>
            </div>
            <button class="add-to-cart" data-id=${product.id}>اضافه به سبد خرید</button>
          </div>
      `;
      productsDOM.innerHTML = result;
    });
  }

  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll('.add-to-cart')];
    buttonsDOM = addToCartBtns;

    addToCartBtns.forEach(btn => {
      const id = btn.dataset.id;
      const isInCart = cart.find(product => product.id === id);

      if (isInCart) {
        btn.innerText = 'به سبد خرید اضافه شد';
        btn.disabled = true;
      }

      btn.addEventListener('click', event => {
        event.target.innerText = 'به سبد خرید اضافه شد';
        event.target.disabled = true;

        // get product from products
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        // add product to cart
        cart = [...cart, addedProduct];
        // save cart
        Storage.saveCart(cart);

        // update cart values
        this.setCartValue(cart);
        // add cart items to DOM
        this.addCartItem(addedProduct);
      });
    });
  }

  setCartValue(cart) {
    // cart total items
    // cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    const productPrice = new Intl.NumberFormat('fa-IR').format(totalPrice);
    cartTotalItems.innerText = tempCartItems;
    cartTotalPrice.innerText = `قیمت نهایی: ${productPrice} تومان`;
  }

  addCartItem(item) {
    const productPrice = new Intl.NumberFormat('fa-IR').format(item.price);
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart__item');
    cartItem.innerHTML = `
      <div class="img-container">
        <img
          class="cart__item-img"
          src=${item.imageUrl}
          alt=${item.alt}
        />
      </div>
      <div class="cart__item-desc">
        <h4 class="cart__item-title">${item.title}</h4>
        <h5 class="cart__item-price">${productPrice} تومان</h5>
      </div>
      <div class="cart__Item-delete">
        <i class="fa-solid fa-trash-can" data-id=${item.id}></i>
      </div>
      <div class="cart__item-controller">
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <span>${item.quantity}</span>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(cartItem);
  }

  setupApp() {
    // get cart
    cart = Storage.getCart();
    // set cart value
    this.setCartValue(cart);
    // add cart items
    cart.forEach(cartItem => this.addCartItem(cartItem));
  }

  cartLogic() {
    clearCartItemsBtn.addEventListener('click', () => this.clearCartItems());

    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('fa-trash-can')) {
        const removeItem = event.target;
        const id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        const addQuantity = event.target;
        const id = addQuantity.dataset.id;
        const addedItem = cart.find(cartItem => cartItem.id == id);
        addedItem.quantity++;
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
        this.setCartValue(cart);
        Storage.saveCart(cart);
      } else if (event.target.classList.contains('fa-chevron-down')) {
        const subQuantity = event.target;
        const id = subQuantity.dataset.id;
        const substractedItem = cart.find(cartItem => cartItem.id == id);

        if (substractedItem.quantity === 1) {
          this.removeItem(id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }

        substractedItem.quantity--;
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
        this.setCartValue(cart);
        Storage.saveCart(cart);
      }
    });
  }

  clearCartItems() {
    cart.forEach(cartItem => this.removeItem(cartItem.id));

    while (cartContent.children.length)
      cartContent.removeChild(cartContent.children[0]);

    closeCartModal();
  }

  removeItem(id) {
    cart = cart.filter(cartItem => cartItem.id != id);
    this.setCartValue(cart);
    Storage.saveCart(cart);

    const button = this.getSingleBtn(id);
    button.innerText = 'اضافه به سبد خرید';
    button.disabled = false;
  }

  getSingleBtn(id) {
    return buttonsDOM.find(btn => btn.dataset.id == id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id == id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const productsData = products.getProducts();

  const ui = new UI();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.setupApp();
  ui.cartLogic();

  Storage.saveProducts(productsData);
});

cartBtn.addEventListener('click', showCartModal);
cartConfirmBtn.addEventListener('click', closeCartModal);
cartBackBtn.addEventListener('click', closeCartModal);

function showCartModal() {
  cartModal.style.opacity = '1';
  cartModal.style.transform = 'scaleX(1)';
  header.style.opacity = '0';
  header.style.transition = '0.4s ease-in-out';
  main.style.opacity = '0';
  main.style.transition = '0.4s ease-in-out';
}

function closeCartModal() {
  cartModal.style.opacity = '0';
  cartModal.style.transform = 'scaleX(0)';
  header.style.opacity = '1';
  header.style.transition = '0.4s ease-in-out';
  main.style.opacity = '1';
  main.style.transition = '0.4s ease-in-out';
}
