import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Product, Category } from '../../types';
import { productsService, categoriesService } from '../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, MESSAGES } from '../../constants';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured products (top rated or most popular)
      const featuredResponse = await productsService.getProducts({
        limit: 6,
        sort: 'reciente',
      });
      setFeaturedProducts(featuredResponse.data);
      
      // Load categories
      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData);
      
      // Load recent products
      const recentResponse = await productsService.getProducts({
        limit: 8,
        sort: 'reciente',
      });
      setRecentProducts(recentResponse.data);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHomeData();
    setIsRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('Category', { categoryId });
  };

  const handleViewAllProducts = () => {
    (navigation as any).getParent()?.navigate('CatalogTab');
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
    >
      <View style={styles.productImageContainer}>
        {product.imagen_url ? (
          <Image source={{ uri: product.imagen_url }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImagePlaceholderText}>📦</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.nombre}
        </Text>
        <Text style={styles.productPrice}>Bs. {product.precio.toFixed(2)}</Text>
        <Text style={styles.productSeller} numberOfLines={1}>
          Vendido por: {product.vendedor?.nombre}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category.id)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>🏷️</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.nombre}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{MESSAGES.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>¡Bienvenido a Unimarket!</Text>
          <Text style={styles.heroSubtitle}>
            La plataforma de comercio para estudiantes Univalle
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={handleViewAllProducts}
          >
            <Text style={styles.heroButtonText}>Explorar Productos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroButtonSecondary}
            onPress={() => (navigation as any).getParent()?.navigate('ProfileTab')}
          >
            <Text style={styles.heroButtonSecondaryText}>Comenzar a Vender</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <TouchableOpacity onPress={handleViewAllProducts}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {featuredProducts.map(renderProductCard)}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <TouchableOpacity onPress={handleViewAllProducts}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 6).map(renderCategoryCard)}
        </View>
      </View>

      {/* Recent Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos Recientes</Text>
          <TouchableOpacity onPress={handleViewAllProducts}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {recentProducts.map(renderProductCard)}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  heroBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.background,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    opacity: 0.9,
  },
  heroButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.buttonBorderRadius,
  },
  heroButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  heroButtonSecondary: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.buttonBorderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroButtonSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: LAYOUT.shadowOffset,
    shadowOpacity: LAYOUT.shadowOpacity,
    shadowRadius: LAYOUT.shadowRadius,
    elevation: LAYOUT.elevation,
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: LAYOUT.buttonBorderRadius,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 40,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  productSeller: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.cardBorderRadius,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: LAYOUT.shadowOffset,
    shadowOpacity: LAYOUT.shadowOpacity,
    shadowRadius: LAYOUT.shadowRadius,
    elevation: LAYOUT.elevation,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
