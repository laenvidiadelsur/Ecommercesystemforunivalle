import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  Surface,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainStackParamList, CartItem } from '../../types';
import { cartService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

type CartScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items
  const {
    data: cart,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => cartService.getCart(),
    enabled: !!user,
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo actualizar la cantidad');
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo eliminar el producto del carrito');
    },
  });

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeItemMutation.mutate(itemId),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos a tu carrito antes de continuar');
      return;
    }
    navigation.navigate('Checkout');
  };

  const calculateTotal = () => {
    return cart?.total || 0;
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.cartItem}>
      <Card.Content style={styles.cartItemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.producto.nombre}
          </Text>
          <Text style={styles.itemPrice}>
            Bs. {item.precio_unitario.toLocaleString()} c/u
          </Text>
          <Text style={styles.itemSeller} numberOfLines={1}>
            Por: {item.producto.vendedor?.nombre || 'Vendedor'}
          </Text>
        </View>
        
        <View style={styles.itemControls}>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={18}
              onPress={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
              disabled={updateQuantityMutation.isPending}
              style={styles.quantityButton}
            />
            <Text style={styles.quantityText}>{item.cantidad}</Text>
            <IconButton
              icon="plus"
              size={18}
              onPress={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
              disabled={updateQuantityMutation.isPending || item.cantidad >= item.producto.stock}
              style={styles.quantityButton}
            />
          </View>
          
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleRemoveItem(item.id)}
            disabled={removeItemMutation.isPending}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyText}>
          Agrega productos para comenzar a comprar
        </Text>
        <Button
          mode="contained"
          onPress={() => (navigation as any).getParent()?.navigate('CatalogTab')}
          style={styles.emptyButton}
        >
          Explorar Productos
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart?.items || []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
      
      <Surface style={styles.checkoutContainer} elevation={4}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            Bs. {calculateTotal().toLocaleString()}
          </Text>
        </View>
        <Divider style={styles.divider} />
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={styles.checkoutButton}
          disabled={isLoading || updateQuantityMutation.isPending}
        >
          Proceder al Pago
        </Button>
      </Surface>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    borderRadius: 8,
  },
  cartList: {
    padding: SPACING.md,
    paddingBottom: 120, // Space for checkout container
  },
  cartItem: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  cartItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  itemSeller: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  itemControls: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    ...TYPOGRAPHY.body,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    margin: 0,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  totalAmount: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: SPACING.md,
  },
  checkoutButton: {
    borderRadius: 8,
  },
});
