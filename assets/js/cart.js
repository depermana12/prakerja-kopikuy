let tempCart = [];
let totalPrice = 0;
let originalPrice = 0;
let couponApplied = false;
const biayaLayanan = 1000;

// Arrow functions with const only hoisted the variable declarations, not the wwhole function. Regular function does.
// so it must be declared above, before invoke it
const formatCurrency = (num) => 
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);


function tempCartTotalPrice() {
  totalPrice = tempCart.reduce(
    (acc, product) => acc + product.hargaint * product.qty,
    0
  );
}

function retrieveLocalStorage() {
  let productInCart = JSON.parse(localStorage.getItem("cart") ?? []);

  productInCart.forEach((product) => updateTempCart(product));
  updateCartUi();
}

retrieveLocalStorage();

function updateTempCart(product) {
  let indexTempProduct = tempCart.findIndex(
    (productTempCart) => productTempCart.nama === product.nama
  );
  indexTempProduct !== -1
    ? tempCart[indexTempProduct].qty++
    : tempCart.push(product);

  console.log(tempCart);
  tempCartTotalPrice();
}

function updateCartUi() {
  if (tempCart.length < 1) {
    cartContent.innerHTML = `<div class="cart-content">
                                            <div class="row align-items-center text-center">
                                                <div class="col">
                                                    <div class="d-flex flex-column align-items-center">
                                                        <div class="mb-auto">
                                                            <p class="fs-3">Your cart is empty</p>
                                                        </div>
                                                        <div>
                                                            <a href="produk.html" class="btn btn-outline-success">
                                                                <i class="bi bi-cart-fill"></i> Continue Shopping
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
    pricePlaceHolder.innerHTML = formatCurrency(totalPrice);
    couponApplied = false;
    const couponInfo = document.getElementById("couponDetails");
    couponInfo.style.display = "none";
  } else {
    let template_list = ``;
    tempCart.forEach((product, index) => {
      template_list += `<div class="cart-content">
                                        <div class="row">
                                            <div class="col-md-2 text-center">
                                                <img src="${
                                                  product.foto
                                                }" height="90" width="90" />
                                            </div>
                                            <div class="col-md-10">
                                                <h5 class="fw-normal text-md-start text-center mt-3 mt-md-0">${
                                                  product.nama
                                                }</h5>
                                                <div class="row">
                                                    <div class="col-md-6 col-6 d-flex align-items-center">
                                                        <span class="fw-bold">${formatCurrency(
                                                          product.hargaint
                                                        )}</span>
                                                    </div>
                                                    <div class="col-md-6 col-6 d-flex justify-content-end align-items-center">
                                                        <button onclick="removeProductHandler(${index})" class="btn btn-white me-2">
                                                            <i class="bi bi-trash" style="font-size: 22px;"></i>
                                                        </button>
                                                        <input class="form-control" type="number" style="width: 60px;" value="${
                                                          product.qty
                                                        }" min="1"
                                                            onchange="updateTempCartQty(${index}, this.value)">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
    });
    cartContent.innerHTML = template_list;
    pricePlaceHolder.innerHTML = formatCurrency(totalPrice);
  }
}

function updateTempCartQty(index, newValue) {
  tempCart[index].qty = newValue;
  tempCartTotalPrice();
  originalPrice = totalPrice;
  if (couponApplied){
    redeemCoupon();
  }
  updateCartUi();
}

function removeFromLocalStorage(productName) {
  let productInCart = JSON.parse(localStorage.getItem("cart")) || [];
  const productIndex = productInCart.findIndex(
    (product) => product.nama === productName
  );

  if (productIndex !== -1) {
    productInCart.splice(productIndex, 1);
    localStorage.setItem("cart", JSON.stringify(productInCart));
  }
}

function removeFromTempCart(index) {
  if (tempCart[index].qty > 1) {
    tempCart[index].qty--;
  } else {
    tempCart.splice(index, 1);
  }
}

function removeProductHandler(index) {
  totalPrice = totalPrice - tempCart[index].hargaint;
  removeFromLocalStorage(tempCart[index].nama);
  removeFromTempCart(index);
  tempCartTotalPrice();
  originalPrice = totalPrice;
  if (couponApplied){
    redeemCoupon();
  }
  updateCartUi();
}

const createDetailsCheckoutEl = (label, value) => {
  const row = document.createElement("div");
  row.classList.add("row", "justify-content-end");

  const colLabel = document.createElement("div");
  const spanLabel = document.createElement("span");
  spanLabel.textContent = label;
  colLabel.classList.add("col-3");

  const colValue = document.createElement("div");
  const spanValue = document.createElement("span");
  spanValue.textContent = value;
  colValue.classList.add("col-3", "span-right");

  colLabel.appendChild(spanLabel);
  colValue.appendChild(spanValue);
  row.appendChild(colLabel);
  row.appendChild(colValue);
  return row;
};

const popoverMessage = `Biaya layanan ${formatCurrency(
  biayaLayanan
)} diterapkan untuk terus memberikan pelayanan terbaik`;

function createPopover(message) {
  const popover = document.createElement("a");
  popover.setAttribute("tabindex", "0");
  popover.classList.add("popover-dismiss");
  popover.setAttribute("data-bs-toggle", "popover");
  popover.setAttribute("role", "button");
  popover.setAttribute("data-bs-trigger", "focus");
  popover.setAttribute("data-bs-content", message);

  const icon = document.createElement("i");
  icon.classList.add("bi", "bi-question-circle");
  popover.appendChild(icon);
  return popover;
}

function checkCoupon() {
  couponApplied ? alert("Coupon has already been applied") : redeemCoupon();
}

function redeemCoupon() {
  const couponCheckoutPage = document.getElementById("couponCheckout");

  couponCheckoutPage.innerHTML = "";
  couponCheckoutPage.style.display = "block";

  const couponInfo = document.getElementById("couponDetails");
  let couponCode = document.getElementById("coupon").value.trim();

  if (couponCode === "PRAKERJA") {
    if (tempCart.length < 1) {
      alert("Please add a product first");
      return;
    }

    if (!couponApplied) {
      originalPrice = totalPrice;
      couponApplied = true;
    }

    totalPrice *= 0.5;

    couponInfo.innerHTML = `Original Price: ${formatCurrency(
      originalPrice
    )}<br>Discounted Price: ${formatCurrency(
      totalPrice
    )}<br>Coupon Applied: <span class="badge bg-secondary">${couponCode}</span> <button onclick="removeDiscount()" class="btn btn-white me-2"><i class="bi bi-trash"></i></button>`;
    couponInfo.style.display = "block";

    const potonganDiskon = createDetailsCheckoutEl(
      "Potongan diskon: ",
      "-" + formatCurrency(originalPrice - totalPrice)
    );
    const voucherKode = createDetailsCheckoutEl("Voucher: ", couponCode);

    couponCheckoutPage.appendChild(potonganDiskon);
    couponCheckoutPage.appendChild(voucherKode);

    updateCartUi();
  } else {
    alert("Invalid coupon code");
  }
}

function removeDiscount() {
  totalPrice = originalPrice;
  tempCartTotalPrice();
  pricePlaceHolder.innerHTML = formatCurrency(totalPrice);
  couponApplied = false;

  const couponInfo = document.getElementById("couponDetails");
  couponInfo.style.display = "none";

  const couponDetailsInfo = document.getElementById("couponCheckout");
  couponDetailsInfo.style.display = "none";
}

const createProductEl = (product) => {
  const row = document.createElement("div");
  row.classList.add("row", "my-2", "py-2");

  const colImage = document.createElement("div");
  colImage.classList.add(
    "col-md-2",
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );

  const image = document.createElement("img");
  image.setAttribute("src", product.foto);
  image.setAttribute("height", "60");
  image.setAttribute("width", "60");
  image.classList.add("img-fluid", "rounded");

  const colDetails = document.createElement("div");
  colDetails.classList.add("col-md-10", "d-flex", "justify-content-between");

  const productTitle = document.createElement("h5");
  productTitle.classList.add(
    "fw-normal",
    "text-md-start",
    "text-center",
    "mt-3",
    "mt-md-0"
  );
  productTitle.textContent = product.nama;

  const productQty = document.createElement("span");
  productQty.classList.add("fw-semibold");
  productQty.textContent = `${product.qty} x ${formatCurrency(
    product.hargaint
  )}`;

  colImage.appendChild(image);
  colDetails.appendChild(productTitle);
  colDetails.appendChild(productQty);
  row.appendChild(colImage);
  row.appendChild(colDetails);
  return row;
};

const orderedProduct = (products) => {
  const checkoutCartModal = document.getElementById("checkoutCartModal");
  checkoutCartModal.innerHTML = "";
  products.forEach((product, index) => {
    const productElement = createProductEl(product);
    checkoutCartModal.appendChild(productElement);
  });
};

const checkoutHandler = () => {
  orderedProduct(tempCart);
  const modal = new bootstrap.Modal(document.getElementById("checkoutModal"));
  modal.show();

  const detailsCheckout = document.getElementById("detailsCheckout");
  detailsCheckout.innerHTML = "";

  if (!couponApplied) {
    originalPrice = totalPrice;
  }

  let subTotal = createDetailsCheckoutEl(
    "Subtotal: ",
    formatCurrency(originalPrice)
  );
  let biayaLayananCheckout = createDetailsCheckoutEl(
    "Biaya layanan: ",
    formatCurrency(biayaLayanan)
  );
  let biayaLayananPopover = biayaLayananCheckout.querySelector(".col-3 span");
  biayaLayananPopover.appendChild(createPopover(popoverMessage));

  detailsCheckout.appendChild(subTotal);
  detailsCheckout.appendChild(biayaLayananCheckout);

  priceCheckout.innerHTML = formatCurrency(totalPrice + biayaLayanan);

  const popover = new bootstrap.Popover(
    document.querySelector(".popover-dismiss"),
    {
      placement: "bottom",
    }
  );
};

document
  .getElementById("checkoutButton")
  .addEventListener("click", checkoutHandler);
