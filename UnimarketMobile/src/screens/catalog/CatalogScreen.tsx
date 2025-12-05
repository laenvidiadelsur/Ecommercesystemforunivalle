import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Searchbar,
  Card,
  Text,
  Button,
  Chip,
  FAB,
  TouchableRipple,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { productsService, categoriesService } from '../../services/supabase';
import { Product, CatalogStackParamList } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

type CatalogScreenNavigationProp = NativeStackNavigationProp<CatalogStackParamList, 'Catalog'>;

export default function CatalogScreen() {
  const navigation = useNavigation<CatalogScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products
  const {
    data: products = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: () => productsService.getProducts({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      limit: 50,
    }),
    select: (res) => res.data,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableRipple onPress={() => handleProductPress(item)}>
      <Card style={styles.productCard}>
        <Card.Cover
          source={{
            uri: item.imagen_url || 'https://via.placeholder.com/300x300?text=Unimarket',
          }}
          style={styles.productImage}
        />
        <Card.Content style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.productPrice}>
            Bs. {item.precio.toFixed(2)}
          </Text>
          <Text style={styles.productSeller} numberOfLines={1}>
            Por: {item.vendedor?.nombre || 'Vendedor'}
          </Text>
          {item.stock <= 5 && item.stock > 0 && (
            <Text style={styles.lowStock}>
              ¡Solo quedan {item.stock}!
            </Text>
          )}
          {item.stock === 0 && (
            <Text style={styles.outOfStock}>Agotado</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => handleProductPress(item)}
            disabled={item.stock === 0}
            style={styles.viewButton}
          >
            Ver Producto
          </Button>
        </Card.Actions>
      </Card>
    </TouchableRipple>
  );

  const renderCategoryChip = ({ item }: { item: { id: string; name: string } }) => (
    <Chip
      mode="outlined"
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={styles.categoryChip}
      textStyle={styles.categoryChipText}
    >
      {item.name}
    </Chip>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar productos</Text>
        <Button mode="contained" onPress={() => refetch()}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Buscar productos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* Categories */}
      <FlatList
        horizontal
        data={[{ id: 'all', name: 'Todos' }, ...categories]}
        renderItem={renderCategoryChip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron productos</Text>
            <Text style={styles.emptySubtext}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        }
      />

      {/* Floating Action Button for vendors */}
      {/* This would be conditionally shown for vendor users */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  searchBar: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipText: {
    fontSize: 14,
  },
  productsList: {
    padding: SPACING.md,
  },
  productCard: {
    flex: 1,
    margin: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  productImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productContent: {
    paddingVertical: SPACING.sm,
  },
  productName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  productPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  productSeller: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  lowStock: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  outOfStock: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  viewButton: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
