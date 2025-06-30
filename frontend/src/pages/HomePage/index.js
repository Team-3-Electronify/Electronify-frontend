import React, { useState, useEffect } from 'react';
import ProductList from '../../components/ProductList';
import Sidebar from '../../components/Sidebar';
import { products as mockProducts } from '../../data/products';
import styles from './styles.module.css';

const HomePage = () => {
  const [products] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState({ id: 'all', min: 0, max: Infinity });
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    const uniqueCategories = mockProducts.reduce((acc, product) => {
      if (!acc.find(cat => cat.id === product.category.id)) {
        acc.push(product.category);
      }
      return acc;
    }, []);
    setCategories(uniqueCategories);
  }, [mockProducts]);

  useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategory) {
      tempProducts = tempProducts.filter(p => p.category.name === selectedCategory);
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPriceRange.id !== 'all') {
      tempProducts = tempProducts.filter(
        p => p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );
    }

    if (sortOrder === 'price-asc') {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      tempProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(tempProducts);
  }, [selectedCategory, searchTerm, selectedPriceRange, sortOrder, products]);

  return (
    <div className={styles.homePageLayout}>
      <Sidebar
        categories={categories}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchTerm}
        onPriceChange={setSelectedPriceRange}
        selectedPriceRange={selectedPriceRange}
        onSortChange={setSortOrder}
      />
      <div className={styles.mainContent}>
        <h1>Our Products</h1>
        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
};

export default HomePage;
