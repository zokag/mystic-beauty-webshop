let allProducts = [];
let categoriesData = [];
let subcategoriesData = [];
let currentPage = 1;
let productsPerPage = 6;

// DOM ready
$(document).ready(function () {
  let page = window.location.pathname.split("/").pop();

  allPagesInitFunctions();
  bindEvents();

  $("#menu-toggle").click(function () {
    $("#nav").toggleClass("active");
  });

  initPageData();

  if (page === "" || page === "index.html") {
    indexInitFunctions();
  }
});

// AJAX
function ajaxCallback(url, result) {
  $.ajax({
    url: url,
    method: "get",
    dataType: "json",
    success: function (data) {
      result(data);
    },
    error: function (xhr) {
      console.log(xhr);
    },
  });
}

//functions on all pages
function allPagesInitFunctions() {
  // Menu
  function initMenu() {
    ajaxCallback("assets/data/navbar.json", function (result) {
      showNavigation(result);
    });
  }

  // Social Icons
  function initSocialIcons() {
    const socialMediaIcons = {
      facebook: "https://www.facebook.com/",
      twitter: "https://www.twitter.com/",
      instagram: "https://www.instagram.com/",
    };
    const socialIconsDiv = document.getElementById("socialIcons");

    for (let icon in socialMediaIcons) {
      const iconElement = document.createElement("i");
      iconElement.classList.add("fs-3", "fab", "fa-" + icon);

      const link = document.createElement("a");
      link.href = socialMediaIcons[icon];
      link.target = "_blank";
      link.appendChild(iconElement);

      socialIconsDiv.appendChild(link);
    }
  }

  // Sticky Header
  function initStickyHeader() {
    $(window).on("scroll", function () {
      if ($(window).scrollTop() > 50) {
        $("header").addClass("scrolled");
      } else {
        $("header").removeClass("scrolled");
      }
    });
  }

  // Daily Mystical Tip
  function initDailyTip() {
    const tips = [
      "Always glow from within",
      "Self-love is the best makeup",
      "Stay mystical, stay magical",
      "Embrace your unique beauty",
      "A smile is your best accessory",
    ];
    const tipIndex = new Date().getDate() % tips.length;
    document.getElementById("dailyTip").textContent =
      `Daily Mystical Tip: ${tips[tipIndex]}`;
  }

  //year function
  function initYear() {
    let year = new Date().getFullYear();
    $("#year").html(year);
  }

  initMenu();
  initSocialIcons();
  initStickyHeader();
  initDailyTip();
  initYear();
}

//functions on index
function indexInitFunctions() {
  // Read more / Read less
  function initReadMoreLess() {
    $("#readMore").on("click", function () {
      $("#dodatniTekst").show();
      $("#readMore").hide();
    });
    $("#readLess").on("click", function () {
      $("#dodatniTekst").hide();
      $("#readMore").show();
    });
  }

  // contact form
  function initFormValidation() {
    $("#myForm").on("submit", function (e) {
      e.preventDefault();

      let firstName = $("#first-name").val().trim();
      let lastName = $("#last-name").val().trim();
      let email = $("#email").val().trim();
      let message = $("#message").val().trim();

      let nameRegex =
        /^[A-ZŽĐŠĆČ][a-zžđšćč]{1,14}(\s[A-ZŽĐŠĆČ][a-zžđšćč]{1,14})*$/;
      let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      let isValid = true;

      $(".error-message").text("");
      $("#success-message").text("");
      $(".form-control").removeClass("error");

      if (!nameRegex.test(firstName)) {
        $("#nameError").text(
          "Please enter a valid first name (start with a capital letter).",
        );
        $("#first-name").addClass("error");
        isValid = false;
      }

      if (!nameRegex.test(lastName)) {
        $("#lastNameError").text(
          "Please enter a valid last name (start with a capital letter).",
        );
        $("#last-name").addClass("error");
        isValid = false;
      }

      if (!emailRegex.test(email)) {
        $("#emailError").text("Please enter a valid email address.");
        $("#email").addClass("error");
        isValid = false;
      }

      if (message.length < 10) {
        $("#messageError").text("Message must be at least 10 characters long.");
        $("#message").addClass("error");
        isValid = false;
      }

      if (isValid) {
        $("#success-message").text("Form successfully submitted.");
        this.reset();
      }
    });
  }

  initFormValidation();
  initReadMoreLess();
}

//Events
function bindEvents() {
  $("#categoryFilter").on("change", function () {
    loadSubcategories();
    getFilteredProducts();
  });

  $(document).on("keyup", "#searchInput", function () {
    getFilteredProducts();
  });

  $(document).on("change", "#sortSelect", function () {
    getFilteredProducts();
  });

  $(document).on("change", "#subcategoryFilter", function () {
    getFilteredProducts();
  });

  $(document).on("click", ".addToCart", function (e) {
    e.preventDefault();

    let id = $(this).data("id");
    // console.log(id)
    addToCart(id);
  });

  $(document).on("click", ".remove-btn", function () {
    let id = $(this).data("id");

    removeFromCart(id);
  });

  $(document).on("click", ".btn-plus", function () {
    let id = $(this).data("id");
    increaseQuantity(id);
  });

  $(document).on("click", ".btn-minus", function () {
    let id = $(this).data("id");
    decreaseQuantity(id);
  });

  $(document).on("click", ".checkout-btn", function (e) {
    e.preventDefault();

    let cart = getCart();

    if (cart.length === 0) {
      showToast("Your cart is empty.", "error")

      return;
    }

    $(".danger-msg").text("");
    window.location.href = "checkout.html";
  });

  $(document).on("submit", "#checkoutForm", function (e) {
    e.preventDefault();
    validateCheckoutForm();
  });

  //pagination-btn
  $(document).on("click", ".pagination-btn", function (e) {
    e.preventDefault();

    let page = parseInt($(this).data("page"));

    if (!isNaN(page) && page > 0) {
      currentPage = page;
      getFilteredProducts();

      $("html, body").animate(
        {
          scrollTop: $(".shopProducts").offset().top - 100,
        },
        300,
      );
    }
  });
}

//dohvatanje podataka iz json fajlova products i categories i funkcije za prikaz proizvoda
function initPageData() {
  ajaxCallback("assets/data/categories.json", function (categoriesResult) {
    categoriesData = categoriesResult;

    ajaxCallback("assets/data/subcategories.json", function (subcatResult) {
      subcategoriesData = subcatResult;

      ajaxCallback("assets/data/products.json", function (productsResult) {
        allProducts = productsResult;

        let page = window.location.pathname.split("/").pop();

        if (page === "" || page === "index.html") {
          showAllProducts();
          showNewProducts(allProducts);
        }

        if (page === "product.html") {
          loadSingleProduct();
        }

        if (page === "shop.html") {
          loadCategoryDropdown();
          loadSubcategories();
          getFilteredProducts();
        }
        if (page === "cart.html") {
          showCart();
        }
        if (page === "checkout.html") {
          loadCheckoutPage();
        }
        updateCartSummary();
        updateCartCount();
      });
    });
  });
}

//navigacija
function showNavigation(menuArray) {
  let sadrzaj = "";
  for (let link of menuArray) {
    sadrzaj += `<li class="nav-item ">
            <a class="nav-link" href="${link.href}">${link.naslov}</a>
        </li>`;
  }
  sadrzaj+=`
  <div class="nav-item">
              <a
                href="documentation.pdf"
                class="border p-1 nav-link"
                target="_blank"
                >Doc <i class="fa-solid fa-file-lines"></i
              ></a>
            </div>
  `
  document.querySelector(".navbar").innerHTML = sadrzaj;
  document.querySelector(".footer-navbar").innerHTML = sadrzaj;

  activeLink();
}

function activeLink() {
  let page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "") {
    page = "index.html";
  }

  $(".nav-link").removeClass("active");
  $(".nav-link").each(function () {
    let link = $(this).attr("href");
    if (link == page) {
      $(this).addClass("active");
    }
  });
}

// Categories
function getCategoryName(categoryId) {
  const category = categoriesData.find(
    (item) => Number(item.id) === Number(categoryId),
  );
  return category ? category.name : "Nepoznato";
}

function loadCategoryDropdown() {
  let html = `<option value="all">All categories</option>`;

  for (let category of categoriesData) {
    html += `<option value="${category.id}">${category.name} (${countProductsByCategory(category.id)})</option>`;
  }

  $("#categoryFilter").html(html);

  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get("category");

  if (categoryFromUrl) {
    $("#categoryFilter").val(categoryFromUrl);
  }
}

function countProductsByCategory(categoryId) {
  let count = 0;
  allProducts.forEach(function (product) {
    if (product.categoryId == categoryId) {
      count++;
    }
  });
  return count;
}

//subcategories
function loadSubcategories() {
  let selectedCategoryId = parseInt($("#categoryFilter").val());
  let html = "";

  let filteredSubcategories = subcategoriesData.filter(function (sub) {
    return sub.categoryId === selectedCategoryId;
  });
  for (let subcategory of filteredSubcategories) {
    html += `
    <div>
      <input type="checkbox", value=${subcategory.id} id="${subcategory.id}" class="subcatCheck me-2"><label for="${subcategory.id}">${subcategory.name} </label>
    </div>
    `;
  }
  $("#subcategoryFilter").html(html);

  if (filteredSubcategories.length > 0) {
    $("#subcategoryLabel").removeClass("hidden");
  } else {
    $("#subcategoryLabel").addClass("hidden");
  }
}

//filter
//By category
function filterProductsByCategory() {
  let selectedCategory = $("#categoryFilter").val();
  let filteredProducts = allProducts.filter(function (product) {
    return Number(selectedCategory) === product.categoryId;
  });

  if (selectedCategory === "all") {
    return allProducts;
  }

  return filteredProducts;
}
//By Search
function filterProductsBySearch(products) {
  const keyword = $("#searchInput").val().toLowerCase().trim();

  if (keyword === "") {
    return products;
  }

  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword),
  );
}
//By subcategory
function filterProductsBySubcategories(products) {
  let selected = [];
  $(".subcatCheck:checked").each(function () {
    selected.push(parseInt($(this).val()));
  });
  if (selected.length === 0) {
    return products;
  }
  return products.filter(function (product) {
    return selected.includes(product.subcategoryId);
  });
}

//sort
function sortProducts(products) {
  const sortValue = $("#sortSelect").val();
  const sortedProducts = [...products];

  sortedProducts.sort(function (a, b) {
    if (sortValue === "priceAsc") {
      return (
        getFinalPrice(a.price.base, a.price.discount) -
        getFinalPrice(b.price.base, b.price.discount)
      );
    }

    if (sortValue === "priceDesc") {
      return (
        getFinalPrice(b.price.base, b.price.discount) -
        getFinalPrice(a.price.base, a.price.discount)
      );
    }
    if (sortValue === "mostReviews") {
      return b.reviews - a.reviews;
    }

    if (sortValue === "ratingAsc") {
      return a.rating - b.rating;
    }

    if (sortValue === "ratingDesc") {
      return b.rating - a.rating;
    }

    return a.id - b.id;
  });
  return sortedProducts;
}

//pagination
function renderPagination(totalPages) {
  let html = ``;

  if (totalPages <= 1) {
    $("#pagination").html("");
    return;
  }

  html += `<ul class="pagination justify-content-center">`;

  html += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a href="#" class="page-link pagination-btn" data-page="${currentPage - 1}">Prev</a>
    </li>
  
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a href="#" class="page-link pagination-btn" data-page="${i}">${i}</a>
      </li>
    
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a href="#" class="page-link pagination-btn" data-page="${currentPage + 1}">Next</a>
    </li>
  
  `;

  html += `</ul>`;

  $("#pagination").html(html);
}

//toast
function showToast(message, type = "success") {
  let toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerHTML = message;

  document.getElementById("toast-container").appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

//Products

//Filtered products
function getFilteredProducts() {
  let filteredProducts = filterProductsByCategory();
  filteredProducts = filterProductsBySubcategories(filteredProducts);
  filteredProducts = filterProductsBySearch(filteredProducts);
  filteredProducts = sortProducts(filteredProducts);

  let totalProducts = filteredProducts.length;
  let totalPages = Math.ceil(totalProducts / productsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  let start = (currentPage - 1) * productsPerPage;
  let end = start + productsPerPage;

  let productsForPage = filteredProducts.slice(start, end);

  showShopProducts(productsForPage);
  renderPagination(totalPages);

  $(".product-count").html(`Number of products: <strong>${totalProducts}</strong>`);

  if (totalProducts === 0) {
    $("#noResults").removeClass("hidden");
    $("#pagination").hide();
  } else {
    $("#noResults").addClass("hidden");
    $("#pagination").show();
  }
}

function showShopProducts(products) {
  let container = $(".shopProducts");
  container.empty();
  let shopProducts = [...products];

  let html = "";

  for (let product of shopProducts) {
    html += renderProductHTML(product);
  }

  container.append(html);
}

function showAllProducts() {
  let limitedProducts = [...allProducts]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);
  let html = "";
  for (let product of limitedProducts) {
    html += renderProductHTML(product);
  }
  document.querySelector(".products").innerHTML = html;
}

function showNewProducts(products) {
  let newProducts = products.filter((p) => p.isNew);
  let html = "";
  for (let product of newProducts) {
    html += renderProductHTML(product);
  }
  document.querySelector(".articles").innerHTML = html;
}

function renderProductHTML(product) {
  return `
    <div class="col-12 col-sm-6 col-xl-4 product-card">
      <div class='article'>
          <div class='product-image'>
              <img src='${product.image}' alt='${product.name}'>
              ${showDiscount(product.price.discount)}
              ${showNew(product.isNew)}
              <a href="product.html?id=${product.id}" class="product-view">View Product</a>
          </div>

          <div>
            <a href="product.html?id=${product.id}" class='name mb-1 mt-2'>
              ${product.name}
            </a>
          </div>

          <div>
            <a href="shop.html?category=${product.categoryId}" class='cat mb-1 mt-2'>
              ${getCategoryName(product.categoryId)}
            </a>
          </div>

          ${getPrice(product.price.base, product.price.discount)}

          <div class='description'>
            ${product.description}
          </div>

          ${renderRating(product.rating, product.reviews)}

          ${renderAddToCartButton(product.stock, product.id)}
      </div>
    </div>`;
}

function getFinalPrice(price, discount) {
  if (discount === 0) {
    return price;
  }
  return price - (price * discount) / 100;
}

function getPrice(price, discount) {
  if (discount === 0) {
    return `<span class="base-price mb-2">${price.toFixed(2)}$</span>`;
  }

  const finalPrice = getFinalPrice(price, discount);

  return `
    <div class="price d-flex align-items-center mb-2">
            <span class="old-price mb-0">${price.toFixed(2)}$</span>
            <span class="discounted-price mb-0 ps-2">${finalPrice.toFixed(2)}$</span>
    </div>
    `;
}

// Show badges
function showDiscount(discount) {
  if (discount) {
    return `
        <span class="discount-badge">-${discount}%</span>
        `;
  } else {
    return "";
  }
}

function showNew(isNew) {
  if (isNew) {
    return `<span class="new-badge">NEW</span>`;
  } else {
    return "";
  }
}

// show one product
function renderSingleProductHTML(product) {
  return `
  <div class="single-product container border py-5">

  <div class="row g-5">
  <div class="col-md-6 single-product-image">
        <div class="image-wrapper">
            <img src="${product.image}" class="img-fluid main-product-image ">
        </div>
    </div>

    <div class="col-md-6">

        <p class="single-product-category">
        ${getCategoryName(product.categoryId)}
        </p>

        <h1>${product.name}</h1>
        ${renderRating(product.rating, product.reviews)}
        ${renderStock(product.stock)}

        ${getPrice(product.price.base, product.price.discount)}

        <div class="product-tabs mt-4">

            <div class="tabs-buttons">
                <button class="tab-btn active" data-tab="description">Description</button>
                <button class="tab-btn" data-tab="ingredients">Ingredients</button>
                <button class="tab-btn" data-tab="usage">How to use</button>
                <button class="tab-btn" data-tab="details">Details</button>
            </div>

            <div class="tabs-content">

                <div class="tab-panel active" id="description">
                    <p>${product.description}</p>
                </div>

                <div class="tab-panel" id="ingredients">
                    <p>${product.ingredients}</p>
                </div>

                <div class="tab-panel" id="usage">
                    <p>${product.howToUse}</p>
                </div>

                <div class="tab-panel" id="details">
                    <ul>
                        <li>Type: ${product.details.type}</li>
                        <li>Size: ${product.details.size}</li>
                        <li>Origin: ${product.details.origin}</li>
                    </ul>
                </div>

            </div>

        </div>

        ${renderAddToCartButton(product.stock, product.id)}

    </div>
    

  </div>

</div>
  `;
}

//find product by id
function findProductById(id) {
  return allProducts.find(function (p) {
    return p.id == id;
  });
}

// one product tabs
function initProductTabs() {
  $(".tab-btn").on("click", function () {
    let tab = $(this).data("tab");

    $(".tab-btn").removeClass("active");
    $(this).addClass("active");

    $(".tab-panel").removeClass("active");
    $("#" + tab).addClass("active");
  });
}

function showOneProduct(id) {
  id = Number(id);

  const oneProduct = allProducts.find((product) => product.id === id);
  return renderSingleProductHTML(oneProduct);
}

function loadSingleProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  $("#oneProduct").html(showOneProduct(id));
  initProductTabs();
}

// rating stars
function renderRating(rating, reviews) {
  let stars = "";
  let fullStars = Math.floor(rating);
  let halfStar = rating % 1 >= 0.5;
  let emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars += `<i class="fas fa-star"></i>`;
  }

  if (halfStar) {
    stars += `<i class="fas fa-star-half-alt"></i>`;
  }

  for (let i = 0; i < emptyStars; i++) {
    stars += `<i class="far fa-star"></i>`;
  }

  return `<div class="rating">${stars} <span class="rating-number">${rating.toFixed(1)} |</span><span class="reviews-count">${reviews} reviews</span></div>`;
}

// available products
function renderStock(stock) {
  if (!stock.available || stock.quantity == 0) {
    return `<p class="out-of-stock"><i class="fa-thin fa-xmark"></i> Out of stock</p>`;
  }
  if (stock.quantity <= 5) {
    return `<p class="low-stock"><i class="fa-thin fa-triangle-exclamation"></i> Only ${stock.quantity} left</p>`;
  }
  return `<p class="in-stock"><i class="fa-thin fa-check"></i> In stock</p>`;
}

//KORPA!!
// add to cart btn
function renderAddToCartButton(stock, productId) {
  const url = window.location.pathname.split("/").pop();
  if (url === "product.html" || url === "shop.html") {
    if (!stock.available || stock.quantity == 0) {
      return `<button class="button disabled" disabled>Out of stock</button>`;
    }
    return `<button class="addToCart button-action button button-outline" data-id="${productId}">Add to cart</button>`;
  }

  return "";
}

//dodajemo u local storage
function addToCart(productId) {
  try{
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existingProduct = cart.find(function (item) {
    return item.id == productId;
  });

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({
      id: productId,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateCartSummary();
  showToast("Product added to cart!");


  }catch(error){
    console.error("An error occured while trying to add to cart.", error);
    
  }
}

//get cart
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    console.error("An error occured while trying to load cart.", error);
    return [];
  }
}

//prikaz proizvoda iz korpe
function showCart() {
  let cart = getCart();
  let html = ``;

  if (cart.length === 0) {
    $("#cartItems").html(
      `<p>Your cart is empty. <a href="shop.html" class="button continue-shopping">shop now</a></p>`,
    );
    return;
  }
  cart.forEach(function (item) {
    let product = findProductById(item.id);
    let finalPrice = getFinalPrice(product.price.base, product.price.discount);

    html += `
      <div class="cart-item d-flex align-items-center justify-content-between p-3 border rounded-4 mb-3">
        <div class="d-flex align-items-center gap-3">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img" />
          <div>
            <h5 class="mb-1">${product.name}</h5>
            <p class="mb-1 text-muted">${getCategoryName(product.categoryId)}</p>
            <span class="fw-semibold">$${finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div class="cart-item-actions d-flex align-items-center gap-3">
          <div class="quantity-box d-flex align-items-center">
            <button class="quantity-btn btn-minus" data-id="${product.id}" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <span class="quantity-value px-3">${item.quantity}</span>
            <button class="quantity-btn btn-plus" data-id="${product.id}" ${item.quantity >= 5 ? "disabled" : ""}>+</button>
          </div>
          <button class="remove-btn" data-id="${product.id}">Remove</button>
        </div>
      </div>
    `;
  });

  $("#cartItems").html(html);
  updateCartSummary();
}

function updateCartCount() {
  let cart = getCart();

  let count = 0;

  cart.forEach(function (item) {
    count += item.quantity;
  });

  $(".cart-badge").text(count);
}

function updateCartSummary() {
  let cart = getCart();

  let subtotal = 0;
  let discount = 0;

  cart.forEach(function (item) {
    let product = findProductById(item.id);

    if (!product) return;

    let basePrice = product.price.base;
    let finalPrice = getFinalPrice(product.price.base, product.price.discount);

    subtotal += basePrice * item.quantity;

    discount += (basePrice - finalPrice) * item.quantity;
  });

  let total = subtotal - discount;

  $("#cartSubtotal").text("$" + subtotal.toFixed(2));
  $("#cartDiscount").text("$" + discount.toFixed(2));
  $("#cartTotal").text("$" + total.toFixed(2));
  $(".products-total").text("$" + total.toFixed(2));
}

//remove

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(function (item) {
    return item.id != productId;
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
  updateCartCount();
  updateCartSummary();
}

//Increase dugme
function increaseQuantity(id) {
  try{
    let cart = getCart();
  
    cart.forEach(function (item) {
      if (item.id == id) {
        item.quantity++;
      }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
  
    showCart();
    updateCartCount();
    updateCartSummary();

  }catch(error){
    console.error("An error occured while trying to increase quantity.", error);

  }
}

//Decrease dugme
function decreaseQuantity(id) {
  try{
    let cart = getCart();
  
    cart.forEach(function (item) {
      if (item.id == id && item.quantity > 1) {
        item.quantity--;
      }
    });
  
    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
    updateCartCount();
    updateCartSummary();

  }catch(error){
    console.error("An error occured while trying to decrease quantity.");

  }
}

//checkout
function loadCheckoutPage() {
  let cart = getCart();

  if (cart.length === 0) {
    $(".checkout-form-wrapper").html(`
      <p>Your cart is empty.</p>
      <a href="shop.html" class="button continue-shopping">Continue shopping</a>
    `);

    $(".checkout-summary").hide();
    return;
  }
  updateCartSummary();
}

function validateCheckoutForm() {
  let fullName = $("#fullName").val().trim();
  let email = $("#emailCheckout").val().trim();
  let phone = $("#phone").val().trim();
  let city = $("#city").val().trim();
  let address = $("#address").val().trim();
  let zipCode = $("#zipCode").val().trim();
  let paymentMethod = $("#paymentMethod").val();

  let nameRegex = /^[A-ZŽĐŠĆČ][a-zžđšćč]{1,20}( [A-ZŽĐŠĆČ][a-zžđšćč]{1,20})+$/;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let phoneRegex = /^[0-9+\s\/-]{6,20}$/;
  let zipRegex = /^[0-9]{4,10}$/;

  let isValid = true;

  $(".error").text("");
  $(".danger-msg").text("");
  $(".success-msg").text("");
  $(".form-control, .form-select").removeClass("error-border");

  if (!nameRegex.test(fullName)) {
    $("#fullNameError").text("Enter full name correctly.");
    $("#fullName").addClass("error-border");
    isValid = false;
  }

  if (!emailRegex.test(email)) {
    $("#emailError").text("Email is not valid.");
    $("#emailCheckout").addClass("error-border");
    isValid = false;
  }

  if (!phoneRegex.test(phone)) {
    $("#phoneError").text("Phone is not valid.");
    $("#phone").addClass("error-border");
    isValid = false;
  }

  if (city.length < 2) {
    $("#cityError").text("City is required.");
    $("#city").addClass("error-border");
    isValid = false;
  }

  if (address.length < 5) {
    $("#addressError").text("Address is required.");
    $("#address").addClass("error-border");
    isValid = false;
  }

  if (!zipRegex.test(zipCode)) {
    $("#zipError").text("ZIP code is not valid.");
    $("#zipCode").addClass("error-border");
    isValid = false;
  }

  if (paymentMethod === "0") {
    $("#paymentError").text("Choose payment method.");
    $("#paymentMethod").addClass("error-border");
    isValid = false;
  }

  if (!isValid) return;

  localStorage.removeItem("cart");
  updateCartCount();

  showToast("Order successfully placed!");

  setTimeout(function () {
    window.location.href = "index.html";
  }, 1500);
}


