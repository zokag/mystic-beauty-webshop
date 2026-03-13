let allProducts = [];
let categoriesData = [];
let subcategoriesData = [];

// DOM ready
$(document).ready(function () {
  let page = window.location.pathname.split("/").pop();

  // funkcije na svim stranicama
  allPagesInitFunctions();
  $("#menu-toggle").click(function(){
  $("#nav").toggleClass("active");
});

  // funkcije samo za početnu stranicu
  if (page === "" || page === "index.html") {
    initPageData();
    indexInitFunctions();
  }

  //funkcije za product stranicu
  if (page === "product.html") {
    initPageData();
  }

  //funkcije za shop stranicu
  if (page === "shop.html") {
    initPageData();
    bindEvents();
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
    ajaxCallback("assets/data/meni.json", function (result) {
      showNavigation(result);
    });
  }

  // Social Icons
  function initSocialIcons() {
    const socialMediaIcons = ["facebook", "twitter", "instagram"];
    const socialIconsDiv = document.getElementById("socialIcons");

    socialMediaIcons.forEach((icon) => {
      const iconElement = document.createElement("i");
      iconElement.classList.add("fs-3", "fab", "fa-" + icon);

      const link = document.createElement("a");
      link.href =
        icon === "facebook"
          ? "https://www.facebook.com/"
          : icon === "twitter"
            ? "https://www.twitter.com/"
            : "https://www.instagram.com/";
      link.target = "_blank";
      link.appendChild(iconElement);

      socialIconsDiv.appendChild(link);
    });
  }

  // Sticky Header
  function initStickyHeader() {
    $(window).on("scroll", function () {
      if ($(window).scrollTop() > 500) {
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

  initMenu();
  initSocialIcons();
  initStickyHeader();
  initDailyTip();
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
          "First name is not in good format. It has to start with a capital letter.",
        );
        $("#first-name").addClass("error");
        isValid = false;
      }

      if (!nameRegex.test(lastName)) {
        $("#lastNameError").text(
          "Last name is not in good format. It has to start with a capital letter.",
        );
        $("#last-name").addClass("error");
        isValid = false;
      }

      if (!emailRegex.test(email)) {
        $("#emailError").text("Email is not valid.");
        $("#email").addClass("error");
        isValid = false;
      }

      if (message.length < 10) {
        $("#messageError").text("Message must have at least 10 characters.");
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
  let html = `<option value="0">All categories</option>`;

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

function countProductsByCategory(categoryId){
  let count = 0;
  allProducts.forEach(function(product){
    if(product.categoryId == categoryId){
      count++;
    }
  })
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
  const categoryId = Number($("#categoryFilter").val());

  if (categoryId === 0) {
    return allProducts;
  }

  return allProducts.filter(
    (product) => Number(product.categoryId) === categoryId,
  );
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

//Products
//Filtered products
function getFilteredProducts() {
  let filteredProducts = filterProductsByCategory();
  filteredProducts = filterProductsBySubcategories(filteredProducts);
  filteredProducts = filterProductsBySearch(filteredProducts);
  filteredProducts = sortProducts(filteredProducts);

  showShopProducts(filteredProducts);
}

function showShopProducts(products) {
  let noResults = $("#noResults");
  let numberOfProducts = products.length;

  let container = $(".shopProducts");
  container.empty();
  let shopProducts = [...products];

  let html = "";

  for (let product of shopProducts) {
    html += renderProductHTML(product);
  }

  if (numberOfProducts === 0) {
    noResults.removeClass("hidden");
    return $(".product-count").html(`Number of Products: ${numberOfProducts}`);
  }


  $(".product-count").html(`Number of Products: ${numberOfProducts}`);
  noResults.addClass("hidden");

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
    <div class="col-12 col-sm-6 col-xl-4">
      <div class='artical'>
          <div class='product-image'>
              <img class='slika' src='${product.image}' alt='${product.name}'>
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

          ${renderAddToCartButton(product.stock)}
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
  <div class="single-product container py-5">

  <div class="row g-5">

    <div class="col-md-6 single-product-image">
        <div class="image-wrapper">
            <img src="${product.image}" class="img-fluid main-product-image">
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

        ${renderAddToCartButton(product.stock)}

    </div>

  </div>

</div>
  `;
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

// add to cart btn
function renderAddToCartButton(stock) {
  const url = window.location.pathname.split("/").pop();
  if (url === "product.html" || url === "shop.html") {
    if (!stock.available || stock.quantity == 0) {
      return `<button class="button disabled" disabled>Out of stock</button>`;
    }
    return `<button class="button button-outline">Add to cart</button>`;
  }

  return "";
}
