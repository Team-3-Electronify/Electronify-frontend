import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProductList from '../../components/ProductList';
import Sidebar from '../../components/Sidebar';
import { productsAPI } from '../../services/api';
import { products as fallbackProducts } from '../../data/products';
import styles from './styles.module.css';

const priceRangeMap = {
  'all': null,
  'range1': 'Less than 50€',
  'range2': '50€ - 150€', 
  'range3': '150€ - 300€',
  'range4': '300€ - 600€',
  'range5': '600€ - 900€',
  'range6': 'More than 900€',
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const filterProductsLocally = (products, filters) => {
  if (!products || products.length === 0) {
    return [];
  }

  let filtered = [...products];

  if (filters.name && filters.name.trim()) {
    const searchTerm = filters.name.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.name && p.name.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.categoryId) {
    filtered = filtered.filter(p => 
      p.category && p.category.id === filters.categoryId
    );
  }

  if (filters.priceGroup && filters.priceGroup !== 'all') {
    const priceRanges = {
      'Less than 50€': { min: 0, max: 50 },
      '50€ - 150€': { min: 50, max: 150 },
      '150€ - 300€': { min: 150, max: 300 },
      '300€ - 600€': { min: 300, max: 600 },
      '600€ - 900€': { min: 600, max: 900 },
      'More than 900€': { min: 900, max: Infinity },
    };
    
    const range = priceRanges[filters.priceGroup];
    if (range) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.price);
        if (isNaN(price)) return false;
        
        if (filters.priceGroup === 'Less than 50€') {
          return price < range.max;
        }
        else if (filters.priceGroup === 'More than 900€') {
          return price >= range.min;
        }
        else {
          return price >= range.min && price < range.max;
        }
      });
    }
  }

  if (filters.sortByPrice === 'asc') {
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceA - priceB;
    });
  } else if (filters.sortByPrice === 'desc') {
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceB - priceA;
    });
  } else if (filters.sortByRating === 'asc') {
    filtered.sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return ratingA - ratingB;
    });
  } else if (filters.sortByRating === 'desc') {
    filtered.sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return ratingB - ratingA;
    });
  }

  return filtered;
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState({ id: 'all', min: 0, max: Infinity });
  const [sortOrder, setSortOrder] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadAllCategories = useCallback(async () => {
    try {
      const allProducts = await productsAPI.getAllProducts();
      if (allProducts && allProducts.length > 0) {
        const uniqueCategories = allProducts.reduce((acc, product) => {
          if (product.category && !acc.find(cat => cat.id === product.category.id)) {
            acc.push(product.category);
          }
          return acc;
        }, []);
        setAllCategories(uniqueCategories);
        setUsingFallback(false);
      } else {
        throw new Error('No products returned from API');
      }
    } catch (err) {
      console.error('Error loading categories, using fallback:', err);
      const uniqueCategories = fallbackProducts.reduce((acc, product) => {
        if (product.category && !acc.find(cat => cat.id === product.category.id)) {
          acc.push(product.category);
        }
        return acc;
      }, []);
      setAllCategories(uniqueCategories);
      setUsingFallback(true);
    }
  }, []);

  const filterParams = useMemo(() => {
    const filters = {};
    
    if (debouncedSearchTerm.trim()) {
      filters.name = debouncedSearchTerm.trim();
    }
    
    if (selectedCategory) {
      const category = allCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        filters.categoryId = category.id;
      }
    }
    
    const priceGroup = priceRangeMap[selectedPriceRange.id];
    if (priceGroup) {
      filters.priceGroup = priceGroup;
    }
    
    if (sortOrder !== 'default') {
      if (sortOrder === 'price-asc') {
        filters.sortByPrice = 'asc';
      } else if (sortOrder === 'price-desc') {
        filters.sortByPrice = 'desc';
      } else if (sortOrder === 'rating-asc') {
        filters.sortByRating = 'asc';
      } else if (sortOrder === 'rating-desc') {
        filters.sortByRating = 'desc';
      }
    }

    return filters;
  }, [debouncedSearchTerm, selectedCategory, allCategories, selectedPriceRange.id, sortOrder]);

  const loadProducts = useCallback(async () => {
    if (!initialLoaded) {
      setLoading(true);
    }
    
    try {
      setError(null);

      let data = [];
      
      if (usingFallback) {
        data = Object.keys(filterParams).length > 0 
          ? filterProductsLocally(fallbackProducts, filterParams)
          : fallbackProducts;
      } else {

        try {
          data = Object.keys(filterParams).length > 0 
            ? await productsAPI.getFilteredProducts(filterParams)
            : await productsAPI.getAllProducts();
          
          if (!Array.isArray(data)) {
            data = [];
          }
          
          if (Object.keys(filterParams).length > 0) {
            data = filterProductsLocally(data, filterParams);
          }
          
        } catch (apiError) {
          console.error('API failed, falling back to local data:', apiError);
          setUsingFallback(true);
          data = Object.keys(filterParams).length > 0 
            ? filterProductsLocally(fallbackProducts, filterParams)
            : fallbackProducts;
        }
      }
      
      setProducts(data);
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');

      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
      if (!initialLoaded) {
        setInitialLoaded(true);
      }
    }
  }, [filterParams, initialLoaded, usingFallback]);


  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);


  useEffect(() => {
    if (allCategories.length > 0) {
      loadProducts();
    }
  }, [loadProducts, allCategories.length]);


  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
  }, []);

  const handlePriceChange = useCallback((priceRange) => {
    setSelectedPriceRange(priceRange);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortOrder(sort);
  }, []);

  const handleRetry = useCallback(() => {
    setUsingFallback(false);
    setError(null);
    loadAllCategories();
    loadProducts();
  }, [loadAllCategories, loadProducts]);

  if (loading && !initialLoaded) {
    return (
      <div className={styles.homePageLayout}>
        <div className={styles.loadingContainer}>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && !initialLoaded && !usingFallback) {
    return (
      <div className={styles.homePageLayout}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePageLayout}>
      <Sidebar
        categories={allCategories}
        onSelectCategory={handleCategoryChange}
        selectedCategory={selectedCategory}
        onSearchChange={handleSearchChange}
        searchTerm={searchTerm}
        onPriceChange={handlePriceChange}
        selectedPriceRange={selectedPriceRange}
        onSortChange={handleSortChange}
      />
      <div className={styles.mainContent}>
        <h1>Our Products</h1>
        {usingFallback && (
          <div className={styles.fallbackNotice}>
            <p>⚠️ Using offline mode - some features may be limited. <button onClick={handleRetry} className={styles.retryButton}>Try reconnecting</button></p>
          </div>
        )}
        {loading && initialLoaded && (
          <div className={styles.loadingIndicator}>
            <p>Updating products...</p>
          </div>
        )}
        {error && initialLoaded && !usingFallback && (
          <div className={styles.errorIndicator}>
            <p>Error: {error}</p>
          </div>
        )}
        {products.length === 0 && !loading && (
          <div className={styles.noResults}>
            <p>No products found matching your criteria.</p>
            {(searchTerm || selectedCategory || selectedPriceRange.id !== 'all') && (
              <p>Try adjusting your filters or search terms.</p>
            )}
          </div>
        )}
        <ProductList products={products} />
      </div>
    </div>
  );
};

export default HomePage;
