const webApi = "https://rikikurnia.com/prakerja/api/kopi";
const localApi = "data.json";
let cart = [];
let wishlist = [];
let selectedCategory = [];

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

function getProductData(category) {
  if (category === "viewAll") {
    Promise.all([
      fetch(webApi).then((response) => response.json()),
      fetch(localApi).then((response) => response.json()),
    ])
      .then(([datawebApi, datalocalApi]) => {
        console.log("datawebApi: ", datawebApi);
        console.log("datalocalApi: ", datalocalApi);
        selectedCategory = [
          ...datawebApi.robusta,
          ...datawebApi.arabica,
          ...datawebApi.nonkopi,
          ...datalocalApi.makanberat,
        ];
        shuffleArray(selectedCategory);
        displayProducts(selectedCategory);
      })
      .catch((error) => console.error("Error fetching api: ", error));
  } else if (category === "makanberat") {
    fetch(localApi)
      .then((response) => response.json())
      .then((data) => {
        console.log("fetched data: ", data);
        selectedCategory = data.makanberat;
        displayProducts(selectedCategory);
      })
      .catch((error) => console.error("Error fetching api: ", error));
  } else {
    fetch(webApi)
      .then((response) => response.json())
      .then((data) => {
        selectedCategory = data[category];
        displayProducts(selectedCategory);
      })
      .catch((error) => console.error("Error fetching api", error));
  }
}

function displayProducts(selectedCategory) {
  productPage.innerHTML = "";

  selectedCategory.forEach((product) => {
    productPage.innerHTML += `<div class="col mb-4 d-flex align-items-stretch">
                                            <div class="card">
                                                <img src="${
                                                  product.foto
                                                }" class="card-img-top" alt="menu ${
      product.nama
    }">
                                                <div class="card-body d-flex flex-column">
                                                    <h5 class="card-title">${
                                                      product.nama
                                                    }</h5>
                                                    <div class="row my-4">
                                                        <div class="col">
                                                            ${product.size}
                                                        </div>
                                                        <div class="col">
                                                            ${product.harga}
                                                        </div>
                                                    </div>
                                                    <div class="d-flex mt-auto align-items-center">
                                                        <button onclick='addToCartHandler(${JSON.stringify(
                                                          {
                                                            nama: product.nama,
                                                            harga:
                                                              product.harga,
                                                            foto: product.foto,
                                                            hargaint:
                                                              product.harga.replace(
                                                                ".",
                                                                ""
                                                              ) * 1,
                                                            qty: 1,
                                                          }
                                                        )})' class="btn btn-success flex-grow-1 me-md-3 title=" Add to cart">
                                                            <i class="bi bi-cart4"></i> Add
                                                        </button>
                                                        <button onclick='toggleWishlist(this, ${JSON.stringify(
                                                          {
                                                            nama: product.nama,
                                                          }
                                                        )})' class="btn btn-outline-danger" title="Add to wishlist">
                                                            <i class="bi bi-heart"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
  });
}

const storeToLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

function updateIconNavbar(iconElementId, data, toggleIcon) {
  const iconElement = document.getElementById(iconElementId);
  // if data is not an array then parse the localStorage
  // ?? is nullish coalescing operator, return left value if not null, otherwise return right value
  const iconData = Array.isArray(data)
    ? data.length
    : JSON.parse(localStorage.getItem(data) ?? []).length;

  iconElement.textContent = iconData;
  iconElement.classList.toggle("d-none", toggleIcon(iconData));
}

updateIconNavbar("cartIcon", "cart", (iconDataLen) => iconDataLen === 0);
updateIconNavbar("wishlistCount", wishlist, (iconDataLen) => iconDataLen === 0);

function addToCart(item) {
  cart.push(item);
  storeToLocalStorage("cart", cart);
  updateIconNavbar("cartIcon", "cart", (iconDataLen) => iconDataLen === 0);
}

const displayModal = (product) => {
  const modalContent = document.getElementById("addedCard");
  modalContent.innerHTML = "";

  // created using createElement() for learning purposes
  const parentDiv = document.createElement("div");
  parentDiv.classList.add("row", "modal-shadow", "m-2");

  const div = document.createElement("div");
  div.classList.add(
    "col-md-3",
    "p-2",
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );

  const image = document.createElement("img");
  image.setAttribute("src", product.foto);
  image.setAttribute("height", "90");
  image.setAttribute("width", "90");
  image.setAttribute("alt", "menu " + product.nama);
  image.classList.add("img-fluid", "rounded");

  const div2 = document.createElement("div");
  div2.classList.add("col-md-9", "d-flex", "align-items-center");

  const heading5 = document.createElement("h5");
  heading5.classList.add("text-md-start", "text-center");
  heading5.textContent = product.nama;

  div.appendChild(image);
  div2.appendChild(heading5);
  parentDiv.appendChild(div);
  parentDiv.appendChild(div2);
  modalContent.appendChild(parentDiv);
};

const addToCartHandler = (product) => {
  addToCart(product);
  displayModal(product);
  const modal = new bootstrap.Modal(
    document.getElementById("addToCartConfirmation")
  );
  modal.show();
};

function toggleWishlist(button, item) {
  const index = wishlist.findIndex(
    (wishlistItem) => wishlistItem.nama === item.nama
  );

  if (index === -1) {
    wishlist.push(item);
    button.innerHTML = '<i class="bi bi-heart-fill"></i>';
  } else {
    wishlist.splice(index, 1);
    button.innerHTML = '<i class="bi bi-heart"></i>';
  }

  button.classList.toggle("text-danger", index === -1);
  updateIconNavbar(
    "wishlistCount",
    wishlist,
    (iconDataLen) => iconDataLen === 0
  );
}

const sortPrice = document.getElementById("sortPrice");
const searchForm = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const keywordNotFound = document.getElementById("keywordNotFound");

getProductData("viewAll");

selectCategory.addEventListener("change", (event) => {
  // cannot using 'this' inside arrow function
  // using targetr to get the element
  const category = event.target.value;
  console.log(category);
  getProductData(category);
  sortPrice.value = "default";
});

sortPrice.addEventListener("change", (event) => {
  const sortType = event.currentTarget.value;
  const keyword = searchForm.value.toLowerCase();
  const filteredData = selectedCategory.filter((product) => {
    return product.nama.toLowerCase().includes(keyword);
  });
  sortProducts(filteredData, sortType);
});

searchForm.addEventListener("keydown", (event) =>
  event.key === "Enter" ? searchResult() : undefined
);
document.getElementById("searchButton").addEventListener("click", searchResult);
document
  .getElementById("clearSearch")
  .addEventListener("click", clearSearchResult);

function sortProducts(data, sortType) {
  if (sortType === "cheap") {
    data.sort((a, b) => a.harga - b.harga);
  } else {
    data.sort((a, b) => b.harga - a.harga);
  }
  checkProductLength(data);
}

function searchResult() {
  sortPrice.value = "default";
  const keyword = searchForm.value.toLowerCase();
  const filteredData = selectedCategory.filter((product) =>
    product.nama.toLowerCase().includes(keyword)
  );

  keywordNotFound.classList.toggle("d-none", filteredData.length > 0);
  checkProductLength(filteredData);
}

function checkProductLength(data) {
  const productPage = document.getElementById("productPage");
  data.length < 1 ? (productPage.innerHTML = "") : displayProducts(data);
}

function clearSearchResult() {
  if (searchForm.value.trim() !== "") {
    searchForm.value = "";
    sortPrice.value = "default";
    keywordNotFound.classList.add("d-none");
    getProductData(selectCategory.value);
  }
}
