const productListElement = document.getElementById('productList');
const productForm = document.getElementById('productForm');

let currentPage = 1;
let totalPages = 1;

const itemsPerPage = 5;

// Ürünleri listeleme işlemi
function listProducts() {
  fetch('https://localhost:44365/api/products')
    .then(response => response.json())
    .then(products => {
      productListElement.innerHTML = ''; // Önceki içeriği temizle

      totalPages = Math.ceil(products.length / itemsPerPage);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, products.length);
      const currentProducts = products.slice(startIndex, endIndex);

      currentProducts.forEach(product => {
        const listItem = document.createElement('div');
        listItem.innerHTML = `
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p>Price: ${product.price} - In Stock: ${product.inStock ? 'Yes' : 'No'}</p>
          <button class="deleteButton" onclick="deleteProduct('${product.id}', this)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;

        if (!product.inStock) {
          listItem.classList.add('inStockFalse');
        }

        productListElement.appendChild(listItem);
      });

      updatePaginationButtons();
    })
    .catch(error => {
      console.error('Hata:', error);
    });
}

// Yeni ürün ekleme işlemi
productForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const price = parseFloat(document.getElementById('price').value);
  const inStock = document.getElementById('inStock').checked;

  const newProduct = {
    name: name,
    description: description,
    price: price,
    inStock: inStock,
  };

  fetch('https://localhost:44365/api/products', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newProduct)
  })
  .then(response => response.json())
  .then(() => {
    // Yeni ürünü ekledikten sonra listeyi güncelle
    listProducts();
    // Formu temizle
    productForm.reset();
  })
  .catch(error => {
    console.error('Hata:', error);
  });
});

// Ürünü silme işlemi
function deleteProduct(productId, button) {
  fetch(`https://localhost:44365/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
  .then(() => {
    // Animasyon için fadeOut() fonksiyonunu kullanalım
    fadeOut(button.parentElement);
  })
  .catch(error => {
    console.error('Hata:', error);
  });
}

// Fade out animasyonu
function fadeOut(element) {
  let opacity = 1;

  const timer = setInterval(() => {
    if (opacity <= 0.1) {
      clearInterval(timer);
      element.style.display = 'none';
    }

    element.style.opacity = opacity;
    opacity -= opacity * 0.3;
  }, 50);
}

// Sayfa numarasını güncelle ve ürünleri listele
function goToPage(pageNumber) {
  currentPage += pageNumber;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  listProducts();
  updatePaginationButtons();
  updateCurrentPageSpan(); // Sayfa numarasını güncelleyelim
}

// Sayfalama butonlarını güncelle
function updatePaginationButtons() {
  const prevButton = document.querySelector('.pagination button:first-child');
  const nextButton = document.querySelector('.pagination button:last-child');

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Sayfa numarasını güncelleyelim
function updateCurrentPageSpan() {
  const currentPageSpan = document.getElementById('currentPageSpan');
  currentPageSpan.textContent = `Sayfa ${currentPage} / ${totalPages}`;
}

function getProductCount() {
  fetch('https://localhost:44365/api/products/count')
    .then(response => response.json())
    .then(count => {
      totalPages = Math.ceil(count / itemsPerPage);
      updateCurrentPageSpan(); // Sayfa numarasını güncelleyelim
    })
    .catch(error => {
      console.error('Hata:', error);
    });
}

// Sayfa yüklendiğinde ve her sayfalamada ürünleri listele
function loadProducts() {
  listProducts();
  getProductCount(); 
  updatePaginationButtons();
  updateCurrentPageSpan(); // Sayfa numarasını güncelleyelim
}



// Sayfa yüklendiğinde ürünleri listele
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  goToPage(0); // Başlangıçta 1. sayfayı göstermek için
});
