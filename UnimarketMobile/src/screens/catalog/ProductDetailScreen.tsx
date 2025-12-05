import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../types';
import { productsService, cartService } from '../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, MESSAGES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { productId } = route.params;
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await productsService.getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para agregar productos al carrito',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => navigation.navigate('Auth' as any) }
        ]
      );
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > (product?.stock || 0)) {
      Alert.alert('Error', `No hay suficiente stock. Solo hay ${product?.stock} unidades disponibles`);
      return;
    }

    setIsAddingToCart(true);

    try {
      await cartService.addToCart(productId, quantity);
      Alert.alert('Éxito', 'Producto agregado al carrito', [{ text: 'OK' }]);
      setQuantity(1);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el producto al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{MESSAGES.loading}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Images */}
      <View style={styles.imageContainer}>
        {product.imagen_url ? (
          <Image source={{ uri: product.imagen_url }} style={styles.mainImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📦</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <Text style={styles.productName}>{product.nombre}</Text>
        <Text style={styles.productPrice}>Bs. {product.precio.toFixed(2)}</Text>
        
        {product.descripcion && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{product.descripcion}</Text>
          </View>
        )}

        {/* Stock Info */}
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            { color: product.stock > 0 ? COLORS.success : COLORS.error },
          ]}>
            {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
          </Text>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerContainer}>
          <Text style={styles.sellerTitle}>Vendedor</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{product.vendedor?.nombre}</Text>
            <Text style={styles.sellerEmail}>{product.vendedor?.email}</Text>
          </View>
        </View>

        {/* Category Info */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Categoría</Text>
          <Text style={styles.categoryText}>{product.categoria?.nombre}</Text>
        </View>

        {/* Quantity Selector */}
        {product.stock > 0 && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Cantidad:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                onPress={incrementQuantity}
                disabled={quantity >= product.stock}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add to Cart Button */}
        {product.stock > 0 ? (
          <TouchableOpacity
            style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={isAddingToCart}
          >
            <Text style={styles.addToCartButtonText}>
              {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockButtonText}>Producto agotado</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

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
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  imageContainer: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: COLORS.backgroundLight,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  imagePlaceholderText: {
    fontSize: 100,
    color: COLORS.textSecondary,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  descriptionContainer: {
    marginBottom: SPACING.lg,
  },
  descriptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.md,
  },
  stockContainer: {
    marginBottom: SPACING.lg,
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  sellerContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.cardBorderRadius,
  },
  sellerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  sellerEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  quantityLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.buttonBorderRadius,
    paddingHorizontal: SPACING.sm,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  quantityButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.buttonBorderRadius,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    minHeight: LAYOUT.buttonHeight,
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  addToCartButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  outOfStockButton: {
    backgroundColor: COLORS.error,
    borderRadius: LAYOUT.buttonBorderRadius,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    minHeight: LAYOUT.buttonHeight,
    justifyContent: 'center',
  },
  outOfStockButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
